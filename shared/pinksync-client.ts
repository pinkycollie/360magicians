// pinksync-client.ts
// Client SDK for PinkSync Real-time WebSocket

export interface PinkSyncOptions {
  token: string;
  baseUrl?: string;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export interface PinkSyncMessage {
  type: string;
  [key: string]: unknown;
}

export class PinkSyncClient {
  private ws: WebSocket | null = null;
  private token: string;
  private baseUrl: string;
  private autoReconnect: boolean;
  private reconnectDelay: number;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private isConnecting = false;
  private isDisconnecting = false;
  
  constructor(options: PinkSyncOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl || 'wss://sync.360magicians.com';
    this.autoReconnect = options.autoReconnect !== false;
    this.reconnectDelay = Math.max(1000, options.reconnectDelay ?? 3000);
  }
  
  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }
      
      this.isConnecting = true;
      
      try {
        // Connect without token in URL - will authenticate via handshake message
        const wsUrl = `${this.baseUrl}/ws`;
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected, authenticating...');
          
          // Send authentication message immediately after connection
          this.ws!.send(JSON.stringify({
            type: 'authenticate',
            token: this.token,
          }));
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Handle authentication response
            if (message.type === 'authenticated') {
              console.log('✅ PinkSync authenticated');
              this.reconnectAttempts = 0;
              this.isConnecting = false;
              this.emit('connected', {});
              resolve();
            } else if (message.type === 'auth_error') {
              console.error('❌ Authentication failed:', message.message);
              this.isConnecting = false;
              this.ws?.close();
              reject(new Error(message.message || 'Authentication failed'));
            } else {
              // Handle regular messages
              this.handleMessage(message);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', { error });
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('❌ PinkSync disconnected');
          this.isConnecting = false;
          this.emit('disconnected', {});
          
          if (this.autoReconnect && !this.isDisconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts})`);
              this.connect().catch(console.error);
            }, this.reconnectDelay);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  disconnect() {
    this.isDisconnecting = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // Reset flag after a short delay to allow reconnection if needed later
    setTimeout(() => {
      this.isDisconnecting = false;
    }, 1000);
  }
  
  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  // ============================================================================
  // ROOM MANAGEMENT
  // ============================================================================
  
  joinRoom(roomName: string) {
    this.send({
      type: 'join_room',
      room: roomName,
    });
  }
  
  leaveRoom(roomName: string) {
    this.send({
      type: 'leave_room',
      room: roomName,
    });
  }
  
  // ============================================================================
  // MESSAGING
  // ============================================================================
  
  broadcast(roomName: string, content: unknown) {
    this.send({
      type: 'broadcast',
      room: roomName,
      content,
    });
  }
  
  sendDirectMessage(targetUserId: string, content: unknown) {
    this.send({
      type: 'direct_message',
      targetUserId,
      content,
    });
  }
  
  // ============================================================================
  // ACCESSIBILITY FEATURES
  // ============================================================================
  
  updateAccessibilityPreferences(preferences: Record<string, unknown>) {
    this.send({
      type: 'accessibility_update',
      preferences,
    });
  }
  
  // ============================================================================
  // EVENT HANDLING
  // ============================================================================
  
  on(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }
  
  off(eventType: string, callback?: (data: any) => void) {
    if (!callback) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.get(eventType)?.delete(callback);
    }
  }
  
  private emit(eventType: string, data: any) {
    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventType} callback:`, error);
      }
    });
  }
  
  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================
  
  private send(message: PinkSyncMessage) {
    if (!this.connected) {
      throw new Error('Cannot send message: not connected');
    }
    
    this.ws!.send(JSON.stringify(message));
  }
  
  private handleMessage(message: PinkSyncMessage) {
    const { type, ...data } = message;
    
    // Emit specific event
    this.emit(type, data);
    
    // Emit generic message event
    this.emit('message', message);
    
    // Log to console in dev mode
    if (typeof window !== 'undefined' && (window as any).PINKSYNC_DEBUG) {
      console.log('📨 PinkSync message:', message);
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  ping() {
    this.send({ type: 'ping' });
  }
  
  async getStats(): Promise<any> {
    const statsUrl = new URL(this.baseUrl.replace(/^wss:/, 'https:'));
    statsUrl.pathname = statsUrl.pathname.replace(/\/$/, '') + '/stats';
    const response = await fetch(statsUrl.toString());
    return response.json();
  }
}
