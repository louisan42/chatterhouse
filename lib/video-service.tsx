"use client";

import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

export interface RemoteStream {
  userId: string;
  userName: string;
  stream?: MediaStream;
}

export function useVideoCall(roomId: string, userId: string, userName: string) {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const myStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const channelRef = useRef<any>(null);

  // Function to create and initialize a new RTCPeerConnection
  const createPeerConnection = (targetUserId: string) => {
    // Create a new RTCPeerConnection with STUN/TURN servers
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    // Add our local stream tracks to the connection
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach(track => {
        if (myStreamRef.current) {
          peerConnection.addTrack(track, myStreamRef.current);
        }
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the remote peer via Supabase
        channelRef.current?.send({
          type: 'ice_candidate',
          targetUserId,
          candidate: event.candidate,
          senderId: userId
        });
      }
    };

    // Listen for remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStreams(prev => {
        // Check if we already have this user's stream
        const existingStreamIndex = prev.findIndex(s => s.userId === targetUserId);
        
        if (existingStreamIndex !== -1) {
          // Update existing stream
          const newStreams = [...prev];
          newStreams[existingStreamIndex] = {
            ...newStreams[existingStreamIndex],
            stream: event.streams[0]
          };
          return newStreams;
        } else {
          // Add new stream
          return [...prev, {
            userId: targetUserId,
            userName: 'User ' + targetUserId.substring(0, 5), // Placeholder name
            stream: event.streams[0]
          }];
        }
      });
    };

    // Store the peer connection
    peerConnectionsRef.current[targetUserId] = peerConnection;
    
    return peerConnection;
  };

  // Function to handle SDP offer
  const handleOffer = async (senderId: string, description: RTCSessionDescriptionInit) => {
    // Create a peer connection if it doesn't exist
    const peerConnection = peerConnectionsRef.current[senderId] || createPeerConnection(senderId);
    
    // Set the remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send the answer back via Supabase
    channelRef.current?.send({
      type: 'answer',
      targetUserId: senderId,
      description: peerConnection.localDescription,
      senderId: userId
    });
  };

  // Function to handle SDP answer
  const handleAnswer = async (senderId: string, description: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnectionsRef.current[senderId];
    
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    }
  };

  // Function to handle ICE candidate
  const handleIceCandidate = async (senderId: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnectionsRef.current[senderId];
    
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  // Initialize the Supabase realtime subscription
  useEffect(() => {
    // Subscribe to the room's video channel
    const channel = supabase.channel(`room-video-${roomId}`, {
      config: {
        broadcast: {
          self: false
        }
      }
    });
    
    // Handle different message types
    channel.on('broadcast', { event: 'video-signal' }, async (payload) => {
      const { type, senderId, targetUserId, description, candidate } = payload.payload;
      
      // Only process messages intended for us
      if (targetUserId && targetUserId !== userId) return;
      
      switch (type) {
        case 'user_joined':
          // Send offer to the new user
          if (myStreamRef.current) {
            const peerConnection = createPeerConnection(senderId);
            
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            channel.send({
              type: 'broadcast',
              event: 'video-signal',
              payload: {
                type: 'offer',
                targetUserId: senderId,
                description: peerConnection.localDescription,
                senderId: userId
              }
            });
          }
          break;
          
        case 'offer':
          await handleOffer(senderId, description);
          break;
          
        case 'answer':
          await handleAnswer(senderId, description);
          break;
          
        case 'ice_candidate':
          await handleIceCandidate(senderId, candidate);
          break;
          
        case 'user_left':
          // Clean up the connection when a user leaves
          if (peerConnectionsRef.current[senderId]) {
            peerConnectionsRef.current[senderId].close();
            delete peerConnectionsRef.current[senderId];
          }
          
          // Remove their stream from the UI
          setRemoteStreams(prev => prev.filter(s => s.userId !== senderId));
          break;
      }
    });
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel;
      }
    });
    
    // Cleanup function
    return () => {
      // Announce that we're leaving
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'video-signal',
          payload: {
            type: 'user_left',
            senderId: userId
          }
        });
        
        // Unsubscribe from the channel
        channelRef.current.unsubscribe();
      }
      
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(connection => {
        connection.close();
      });
      peerConnectionsRef.current = {};
      
      // Stop all media tracks
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [roomId, userId]);

  // Start camera function
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      myStreamRef.current = stream;
      setIsCameraOn(true);
      setIsMicOn(true);
      
      // Announce to the room that we've joined with video
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'video-signal',
          payload: {
            type: 'user_joined',
            senderId: userId,
            userName: userName
          }
        });
      }
      
      return stream;
    } catch (err) {
      console.error("Error accessing camera and microphone:", err);
      return null;
    }
  };

  // Stop camera function
  const stopCamera = () => {
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      setIsCameraOn(false);
      setIsMicOn(false);
      setMyStream(null);
      myStreamRef.current = null;
      
      // Announce that we're turning off video
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'video-signal',
          payload: {
            type: 'user_left',
            senderId: userId
          }
        });
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    if (!myStreamRef.current) return null;
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      
      // Replace video track with screen share track
      const videoTrack = screenStream.getVideoTracks()[0];
      
      // Replace track in all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      // Handle the user stopping screen sharing
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
      return screenStream;
    } catch (err) {
      console.error("Error sharing screen:", err);
      return null;
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (!myStreamRef.current || !screenStreamRef.current) return;
    
    // Stop screen sharing tracks
    screenStreamRef.current.getTracks().forEach(track => track.stop());
    setIsScreenSharing(false);
    
    // Replace the track in all peer connections with the original camera track
    const videoTrack = myStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
    
    screenStreamRef.current = null;
  };

  return {
    myStream,
    remoteStreams,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    isCameraOn,
    isMicOn,
    isScreenSharing,
  };
}