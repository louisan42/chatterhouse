"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Room, getPublicRooms, createRoom } from '@/lib/room-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const { user, isLoading, signOut } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Define topics for therapy rooms
  const topics = [
    'Anxiety',
    'Depression',
    'Stress Management',
    'Work-Life Balance',
    'Relationship Issues',
    'Self-Improvement',
    'Grief & Loss',
    'Mindfulness',
    'Addiction Recovery',
    'General Support'
  ];

  // Fetch rooms when the component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await getPublicRooms();
        setRooms(roomsData);
        setIsLoadingRooms(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setIsLoadingRooms(false);
        setError('Failed to load rooms');
      }
    };

    // Only fetch if user is authenticated
    if (!isLoading && user) {
      fetchRooms();
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim() || !newRoomTopic.trim() || !newRoomDescription.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const newRoom = await createRoom(
        newRoomName,
        newRoomTopic,
        newRoomDescription
      );
      
      if (newRoom) {
        setRooms([newRoom, ...rooms]);
        setNewRoomName('');
        setNewRoomTopic('');
        setNewRoomDescription('');
        setShowCreateRoom(false);
        setError(null);
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
    }
  };

  if (isLoading || (isLoadingRooms && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              ChatterHouse
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chat Rooms</h1>
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {showCreateRoom ? 'Cancel' : 'Create Room'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Create Room Form */}
        {showCreateRoom && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create a New Chat Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="room-topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <select
                    id="room-topic"
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="room-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="room-description"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms List */}
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                    {room.topic}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/chat?roomId=${room.id}`}
                      className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800"
                    >
                      Join Room
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <span className="text-sm text-gray-500">
                      {new Date(room.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900">No rooms available</h3>
            <p className="mt-1 text-gray-500">Be the first one to create a new chat room!</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateRoom(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create a Room
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}