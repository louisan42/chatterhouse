"use client";

import { supabase } from './supabase';

export interface Room {
  id: string;
  name: string;
  topic: string;
  description: string;
  is_private: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return data || [];
}

export async function getPublicRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching public rooms:', error);
    return [];
  }
  
  return data || [];
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching room:', error);
    return null;
  }
  
  return data;
}

export async function createRoom(name: string, topic: string, description: string, isPrivate = false): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .insert([
      { name, topic, description, is_private: isPrivate }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating room:', error);
    return null;
  }
  
  return data;
}

export async function getMessages(roomId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data || [];
}

export async function sendMessage(roomId: string, senderId: string, senderName: string, text: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { room_id: roomId, sender_id: senderId, sender_name: senderName, text }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    return null;
  }
  
  return data;
}

// Setup real-time subscription for new messages
export function subscribeToRoomMessages(roomId: string, callback: (message: Message) => void) {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, 
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

// Booking related functions for private sessions
export interface Booking {
  id: string;
  user_id: string;
  therapist_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export async function createBooking(
  userId: string,
  therapistId: string,
  startTime: string,
  endTime: string
): Promise<Booking | null> {
  // First create a private room for the session
  const roomResult = await createRoom(
    `Private Session`,
    'therapy',
    'One-on-one therapy session',
    true
  );
  
  if (!roomResult) return null;
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      { 
        user_id: userId, 
        therapist_id: therapistId, 
        room_id: roomResult.id,
        start_time: startTime,
        end_time: endTime,
        status: 'pending' 
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating booking:', error);
    return null;
  }
  
  return data;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
  
  return data || [];
}

export interface Therapist {
  id: string;
  user_id: string;
  name: string;
  specialization: string;
  bio: string;
  profile_image?: string;
}

export async function getTherapists(): Promise<Therapist[]> {
  const { data, error } = await supabase
    .from('therapists')
    .select('*');
  
  if (error) {
    console.error('Error fetching therapists:', error);
    return [];
  }
  
  return data || [];
}