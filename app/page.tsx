"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Room, getPublicRooms } from "@/lib/room-service";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const publicRooms = await getPublicRooms();
      setRooms(publicRooms);
      setIsLoadingRooms(false);
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">ChatterHouse</h1>
          </div>
          <div>
            {!isLoading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link 
                    href="/login" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">A Safe Space for Connection and Healing</h2>
              <p className="text-xl mb-8">
                Join our community to chat, share, and relieve stress. Connect with others or book a private session with a therapist.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href={user ? "/rooms" : "/signup"} 
                  className="bg-white text-indigo-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-100"
                >
                  {user ? "Join a Room" : "Get Started"}
                </Link>
                <Link 
                  href="/about" 
                  className="border border-white text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-white hover:bg-opacity-10"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/chat-illustration.svg"
                alt="People chatting"
                width={600}
                height={400}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured rooms section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Chat Rooms</h2>
          
          {isLoadingRooms ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.slice(0, 6).map((room) => (
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
                    <Link
                      href={`/rooms/${room.id}`}
                      className="text-indigo-600 font-medium hover:text-indigo-800"
                    >
                      Join this room →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No public rooms available at the moment.</p>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link
              href="/rooms"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
            >
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How ChatterHouse Helps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect with Others</h3>
              <p className="text-gray-600">
                Join topic-based chat rooms and connect with people who understand what you're going through.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                  <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Chat Support</h3>
              <p className="text-gray-600">
                Face-to-face interaction through secure video chat helps create meaningful connections.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Support</h3>
              <p className="text-gray-600">
                Book private sessions with licensed therapists for personalized support and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our community today and take the first step toward better mental wellbeing.
          </p>
          <Link 
            href={user ? "/rooms" : "/signup"} 
            className="bg-white text-indigo-600 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100"
          >
            {user ? "Join a Chat Room" : "Sign Up for Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ChatterHouse</h3>
              <p className="text-gray-400">
                A safe space for connection and healing through video and text chat.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/rooms" className="text-gray-400 hover:text-white">Chat Rooms</Link></li>
                <li><Link href="/therapists" className="text-gray-400 hover:text-white">Therapists</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@chatterhouse.com</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ChatterHouse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
