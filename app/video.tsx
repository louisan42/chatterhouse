"use client";

import React, { useEffect, useRef } from 'react';
import { useVideoCall, RemoteStream } from '@/lib/video-service';
import { useAuth } from '@/lib/auth-context';

interface VideoProps {
  roomId: string;
  userId: string;
}

const VideoComponent: React.FC<VideoProps> = ({ roomId, userId }) => {
  const { user } = useAuth();
  const userName = user?.email || 'Anonymous';
  
  const {
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
    isScreenSharing
  } = useVideoCall(roomId, userId, userName);

  const myVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  return (
    <div className="flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
        {/* My video */}
        <div className="relative bg-black rounded overflow-hidden">
          {myStream ? (
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-800 text-white">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p>Your video is off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Remote streams */}
        {remoteStreams.map((remote) => (
          <div key={remote.userId} className="relative bg-black rounded overflow-hidden">
            {remote.stream ? (
              <RemoteVideo stream={remote.stream} />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-800 text-white">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <p>Peer video is off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {remote.userName || `User ${remote.userId.substring(0, 5)}`}
            </div>
          </div>
        ))}
        
        {/* Empty placeholder slots when there are fewer than 3 participants */}
        {remoteStreams.length === 0 && (
          <div className="relative bg-black rounded overflow-hidden">
            <div className="flex items-center justify-center h-48 bg-gray-800 text-white">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <p>Waiting for others to join...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 p-4 bg-gray-800">
        <button
          onClick={myStream ? toggleCamera : startCamera}
          className={`p-3 rounded-full ${
            isCameraOn ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
          aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {isCameraOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M18.75 4.5h-15A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 19.5h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25z" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            isMicOn ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
          disabled={!myStream}
          aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`p-3 rounded-full ${
            isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white transition-colors`}
          disabled={!myStream}
          aria-label={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </button>

        <button
          onClick={stopCamera}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          disabled={!myStream}
          aria-label="Leave call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const RemoteVideo: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default VideoComponent;