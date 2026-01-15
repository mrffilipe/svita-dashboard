import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { RequestDto } from '../types';

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL;

export const useSignalR = (tenantKey: string | null) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantKey) {
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        skipNegotiation: false,
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, [tenantKey]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR Connected');
        
        // Invocar SubscribeRegistered para começar a receber requests
        await connection.invoke('SubscribeRegistered');
        console.log('Subscribed to registered requests');
        
        setIsConnected(true);
        setError(null);
      } catch (err: any) {
        console.error('SignalR Connection Error:', err);
        setError('Erro ao conectar ao servidor em tempo real');
        setIsConnected(false);
      }
    };

    startConnection();

    connection.on('RequestsRegisteredUpdated', (updatedRequests: RequestDto[]) => {
      console.log('Received RequestsRegisteredUpdated:', updatedRequests);
      setRequests(updatedRequests);
    });

    connection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      setIsConnected(true);
      setError(null);
    });

    connection.onclose(() => {
      console.log('SignalR Disconnected');
      setIsConnected(false);
    });

    return () => {
      connection.off('RequestsRegisteredUpdated');
    };
  }, [connection]);

  const disconnect = useCallback(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.stop();
    }
  }, [connection]);

  const refresh = useCallback(async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('SubscribeRegistered');
        console.log('Refreshed registered requests');
      } catch (err) {
        console.error('Error refreshing requests:', err);
      }
    }
  }, [connection]);

  return {
    requests,
    isConnected,
    error,
    disconnect,
    refresh,
  };
};
