import React, { createContext, useContext, useEffect, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';

interface LiveKitContextType {
  room: Room | null;
  isConnected: boolean;
  connectToRoom: (roomName: string) => Promise<void>;
  disconnectFromRoom: () => void;
  error: string | null;
}

const LiveKitContext = createContext<LiveKitContextType | undefined>(undefined);

export const LiveKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToRoom = async (roomName: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('invis_token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Falha ao obter token do LiveKit');
      }

      const { token, wsUrl } = await res.json();

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom.on(RoomEvent.Connected, () => setIsConnected(true));
      newRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setRoom(null);
      });

      await newRoom.connect(wsUrl, token);
      setRoom(newRoom);
    } catch (err: any) {
      console.error('Erro na conexão LiveKit:', err);
      setError(err.message);
    }
  };

  const disconnectFromRoom = () => {
    if (room) {
      room.disconnect();
    }
  };

  useEffect(() => {
    return () => {
      if (room) room.disconnect();
    };
  }, [room]);

  return (
    <LiveKitContext.Provider value={{ room, isConnected, connectToRoom, disconnectFromRoom, error }}>
      {children}
    </LiveKitContext.Provider>
  );
};

export const useLiveKit = () => {
  const context = useContext(LiveKitContext);
  if (context === undefined) {
    throw new Error('useLiveKit deve ser usado dentro de um LiveKitProvider');
  }
  return context;
};
