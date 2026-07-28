import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { v4 as uuidv4 } from 'uuid';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'devsecret';
const LIVEKIT_HOST = process.env.LIVEKIT_HOST || 'http://localhost:7880';

const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

export class LiveKitService {
  /**
   * Create a LiveKit room for a livestream
   */
  async createRoom(roomName: string): Promise<{ roomName: string }> {
    try {
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60 * 10, // 10 minutes
        maxParticipants: 50,
      });
      return { roomName };
    } catch (error: any) {
      // Room might already exist
      if (error.message?.includes('already exists')) {
        return { roomName };
      }
      throw error;
    }
  }

  /**
   * Generate an access token for a participant
   */
  generateToken(
    roomName: string,
    identity: string,
    metadata?: Record<string, any>,
    isHost: boolean = false
  ): string {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: identity,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      ttl: '6h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: isHost ? (['camera', 'microphone', 'screen_share'] as any) : ([] as any),
      hidden: !isHost,
    });

    return at.toJwt() as string;
  }

  /**
   * Generate a host token (can publish video/audio)
   */
  generateHostToken(roomName: string, userId: string, username: string): string {
    return this.generateToken(roomName, userId, { username, role: 'host' }, true);
  }

  /**
   * Generate a viewer token (can only subscribe)
   */
  generateViewerToken(roomName: string, userId: string, username: string): string {
    return this.generateToken(roomName, userId, { username, role: 'viewer' }, false);
  }

  /**
   * Generate a guest token (can publish but limited)
   */
  generateGuestToken(roomName: string, userId: string, username: string): string {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: username,
      metadata: JSON.stringify({ username, role: 'guest' }),
      ttl: '6h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: ['camera', 'microphone'],
    });

    return at.toJwt();
  }

  /**
   * Close a LiveKit room
   */
  async closeRoom(roomName: string): Promise<void> {
    try {
      await roomService.deleteRoom(roomName);
    } catch (error) {
      console.error('Error closing LiveKit room:', error);
    }
  }

  /**
   * List participants in a room
   */
  async listParticipants(roomName: string): Promise<any[]> {
    try {
      return await roomService.listParticipants(roomName);
    } catch {
      return [];
    }
  }

  /**
   * Remove a participant from a room
   */
  async removeParticipant(roomName: string, identity: string): Promise<void> {
    try {
      await roomService.removeParticipant(roomName, identity);
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  }

  /**
   * Mute a participant's track
   */
  async muteParticipantTrack(roomName: string, identity: string, trackSid: string, muted: boolean): Promise<void> {
    try {
      await roomService.mutePublishedTrack(roomName, identity, trackSid, muted);
    } catch (error) {
      console.error('Error muting participant track:', error);
    }
  }

  /**
   * Generate a unique room name
   */
  generateRoomName(userId: string): string {
    return `sparklive_${userId}_${uuidv4().slice(0, 8)}`;
  }
}

export const liveKitService = new LiveKitService();