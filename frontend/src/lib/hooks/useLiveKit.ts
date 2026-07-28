'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, ConnectionState, VideoPresets } from 'livekit-client';
import { apiGet, apiPost } from '@/lib/apiClient';

interface UseLiveKitOptions {
  token?: string;
  roomName?: string;
  autoConnect?: boolean;
}

interface UseLiveKitReturn {
  room: Room | null;
  participants: RemoteParticipant[];
  localParticipant: LocalParticipant | null;
  connectionState: ConnectionState;
  connectionQuality: number;
  isConnecting: boolean;
  error: string | null;
  connect: (token: string, roomName: string) => Promise<void>;
  disconnect: () => void;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  screenShare: () => Promise<void>;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
  isScreenSharing: boolean;
  activeSpeakers: string[];
  participantCount: number;
}

export function useLiveKit(options: UseLiveKitOptions = {}): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [connectionQuality, setConnectionQuality] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [participantCount, setParticipantCount] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const updateParticipants = useCallback((currentRoom: Room) => {
    const remoteParticipants: RemoteParticipant[] = [];
    currentRoom.remoteParticipants.forEach((participant) => {
      remoteParticipants.push(participant);
    });
    setParticipants(remoteParticipants);
    setParticipantCount(remoteParticipants.length + (currentRoom.localParticipant ? 1 : 0));
  }, []);

  const connect = useCallback(async (token: string, roomName: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Create new room if needed
      if (!roomRef.current) {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        roomRef.current = newRoom;
        setRoom(newRoom);

        // Setup event listeners
        newRoom.on(RoomEvent.ParticipantConnected, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackPublished, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackUnpublished, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
          setConnectionState(state);
          
          if (state === ConnectionState.Connected) {
            setIsConnecting(false);
            reconnectAttempts.current = 0;
          }
          
          if (state === ConnectionState.Disconnected) {
            setIsConnecting(false);
            setLocalParticipant(null);
          }
        });

        newRoom.on(RoomEvent.ConnectionQualityChanged, (quality) => {
          setConnectionQuality(quality);
        });

        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          setActiveSpeakers(speakers.map(s => s.identity));
        });

        newRoom.on(RoomEvent.MediaDevicesChanged, () => {
          const cam = newRoom.localParticipant?.isCameraEnabled ?? false;
          const mic = newRoom.localParticipant?.isMicrophoneEnabled ?? false;
          setIsCameraOn(cam);
          setIsMicrophoneOn(mic);
        });

        newRoom.on(RoomEvent.TrackMuted, (pub) => {
          if (pub.kind === 'video') setIsCameraOn(false);
          if (pub.kind === 'audio') setIsMicrophoneOn(false);
        });

        newRoom.on(RoomEvent.TrackUnmuted, (pub) => {
          if (pub.kind === 'video') setIsCameraOn(true);
          if (pub.kind === 'audio') setIsMicrophoneOn(true);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          setIsScreenSharing(false);
        });

        newRoom.on(RoomEvent.Reconnecting, () => {
          setIsConnecting(true);
        });

        newRoom.on(RoomEvent.Reconnected, () => {
          setIsConnecting(false);
          reconnectAttempts.current = 0;
        });
      }

      // Connect to the room
      await roomRef.current.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880', token);
      
      setLocalParticipant(roomRef.current.localParticipant);
      updateParticipants(roomRef.current);

      const cam = roomRef.current.localParticipant?.isCameraEnabled ?? false;
      const mic = roomRef.current.localParticipant?.isMicrophoneEnabled ?? false;
      setIsCameraOn(cam);
      setIsMicrophoneOn(mic);

    } catch (err: any) {
      console.error('LiveKit connection error:', err);
      setError(err.message || 'Failed to connect to the stream');
      setIsConnecting(false);

      // Auto reconnect logic
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        setTimeout(() => {
          connect(token, roomName).catch(() => {});
        }, delay);
      }
    }
  }, [updateParticipants]);

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    setParticipants([]);
    setLocalParticipant(null);
    setParticipantCount(0);
  }, []);

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (err) {
      console.error('Error toggling camera:', err);
    }
  }, [isCameraOn]);

  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicrophoneOn);
      setIsMicrophoneOn(!isMicrophoneOn);
    } catch (err) {
      console.error('Error toggling microphone:', err);
    }
  }, [isMicrophoneOn]);

  const screenShare = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    try {
      if (isScreenSharing) {
        await roomRef.current.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await roomRef.current.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  }, [isScreenSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  return {
    room: roomRef.current,
    participants,
    localParticipant,
    connectionState,
    connectionQuality,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleCamera,
    toggleMicrophone,
    screenShare,
    isCameraOn,
    isMicrophoneOn,
    isScreenSharing,
    activeSpeakers,
    participantCount,
  };
}

// Helper to get LiveKit token from backend
export async function getLiveKitToken(streamId: string, token: string, role: 'host' | 'viewer' = 'viewer'): Promise<string> {
  const endpoint = role === 'host' ? `/api/live/${streamId}/host-token` : `/api/live/${streamId}/viewer-token`;
  const data = await apiGet<any>(endpoint, token);
  return data.token;
}