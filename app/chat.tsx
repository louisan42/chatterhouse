"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Message, Room, getMessages, getRoomById, sendMessage, subscribeToRoomMessages } from '@/lib/room-service';
import Video from './video';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ChatRoom: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || 'default-room';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch room data and messages
  useEffect(() => {
    const fetchRoomAndMessages = async () => {
      try {
        const roomData = await getRoomById(roomId);
        if (!roomData) {
          setError('Room not found');
          setIsLoadingRoom(false);
          return;
        }
        
        setRoom(roomData);
        
        const messageData = await getMessages(roomId);
        setMessages(messageData);
        
        setIsLoadingRoom(false);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError('Failed to load chat room');
        setIsLoadingRoom(false);
      }
    };

    if (!isLoading && user) {
      fetchRoomAndMessages();
    } else if (!isLoading && !user) {
      router.push('/login?redirect=chat&roomId=' + roomId);
    }
  }, [roomId, user, isLoading, router]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user || !room) return;
    
    const subscription = subscribeToRoomMessages(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, room, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user || !room) return;
    
    try {
      await sendMessage(
        roomId,
        user.id,
        user.email || 'Anonymous',
        newMessage
      );
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Show error to user
    }
  };

  // Handle pressing Enter to send a message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading || isLoadingRoom) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <Link href="/rooms" className="text-indigo-600 hover:text-indigo-800">
          Back to Rooms
        </Link>
      </div>
    );
  }

  if (!user) {
    return null; // Should redirect to login
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{room?.name || 'Chat Room'}</h1>
          <p className="text-sm text-gray-600">{room?.topic || 'General Discussion'}</p>
        </div>
        <Link href="/rooms" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Back to Rooms
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Video section */}
        <div className="w-full md:w-1/2 p-4 bg-white shadow-sm">
          <div className="rounded-lg overflow-hidden">
            <Video roomId={roomId} userId={user.id} />
          </div>
        </div>

        {/* Chat section */}
        <div className="flex flex-col flex-1 p-4 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="font-medium mb-1">
                          {message.sender_id === user.id ? 'You' : message.sender_name}
                        </div>
                        <div>{message.text}</div>
                        <div className="text-xs mt-1 opacity-80">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;