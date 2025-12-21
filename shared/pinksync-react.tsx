// pinksync-react.tsx
// React Hook for PinkSync WebSocket Client

import { useEffect, useState, useCallback } from 'react';
import { PinkSyncClient, PinkSyncOptions } from './pinksync-client.ts';

export interface UsePinkSyncOptions extends PinkSyncOptions {
  enabled?: boolean;
}

export function usePinkSync(options: UsePinkSyncOptions) {
  const [client, setClient] = useState<PinkSyncClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (options.enabled === false) return;
    
    const newClient = new PinkSyncClient(options);
    setClient(newClient);
    
    newClient.on('connected', () => setConnected(true));
    newClient.on('disconnected', () => setConnected(false));
    newClient.on('error', ({ error }) => setError(error));
    
    newClient.connect().catch(setError);
    
    return () => {
      newClient.disconnect();
    };
  }, [options.token, options.baseUrl, options.enabled]);
  
  const joinRoom = useCallback((roomName: string) => {
    client?.joinRoom(roomName);
  }, [client]);
  
  const leaveRoom = useCallback((roomName: string) => {
    client?.leaveRoom(roomName);
  }, [client]);
  
  const broadcast = useCallback((roomName: string, content: unknown) => {
    client?.broadcast(roomName, content);
  }, [client]);
  
  const sendDirectMessage = useCallback((targetUserId: string, content: unknown) => {
    client?.sendDirectMessage(targetUserId, content);
  }, [client]);
  
  const updateAccessibilityPreferences = useCallback((preferences: Record<string, unknown>) => {
    client?.updateAccessibilityPreferences(preferences);
  }, [client]);
  
  return {
    client,
    connected,
    error,
    joinRoom,
    leaveRoom,
    broadcast,
    sendDirectMessage,
    updateAccessibilityPreferences,
  };
}
