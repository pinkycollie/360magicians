// sync.360magicians.com - PinkSync Orchestrator with WebSocket Support
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// WebSocket connection management
const rooms = new Map<string, Set<WebSocket>>();
const userConnections = new Map<string, WebSocket>();

// ============================================================================
// PinkSync Endpoints
// ============================================================================

// GET /health - Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    service: 'PinkSync Orchestrator',
    region: Deno.env.get('DENO_REGION'),
    activeConnections: userConnections.size,
    activeRooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// GET /stats - Get server statistics
app.get('/stats', (ctx) => {
  const roomStats = Array.from(rooms.entries()).map(([name, members]) => ({
    name,
    memberCount: members.size,
  }));
  
  return ctx.json({
    totalConnections: userConnections.size,
    totalRooms: rooms.size,
    rooms: roomStats,
    region: Deno.env.get('DENO_REGION'),
  });
});

// POST /sync - Trigger synchronization
app.post('/sync', async (ctx) => {
  const { entity, action, data } = await ctx.request.json();
  
  // Log sync event
  await supabase.from('sync_logs').insert({
    entity,
    action,
    data,
    timestamp: new Date().toISOString(),
  });
  
  return ctx.json({
    synced: true,
    entity,
    action,
  });
});

// GET /ws - WebSocket endpoint
app.get('/ws', (ctx) => {
  // WebSocket upgrade without authentication (will authenticate via handshake)
  const upgrade = ctx.request.headers.get('upgrade') || '';
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }
  
  const { socket, response } = Deno.upgradeWebSocket(ctx.request);
  
  let userId: string | null = null;
  let authenticated = false;
  
  // Setup WebSocket handlers
  socket.onopen = () => {
    console.log('🔌 WebSocket connection established, awaiting authentication');
  };
  
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle authentication message
      if (message.type === 'authenticate' && !authenticated) {
        const token = message.token;
        
        if (!token) {
          socket.send(JSON.stringify({
            type: 'auth_error',
            message: 'Missing authentication token',
          }));
          socket.close();
          return;
        }
        
        // Verify token with DeafAUTH (simplified for now)
        userId = extractUserIdFromToken(token);
        
        if (!userId) {
          socket.send(JSON.stringify({
            type: 'auth_error',
            message: 'Invalid authentication token',
          }));
          socket.close();
          return;
        }
        
        authenticated = true;
        userConnections.set(userId, socket);
        
        console.log(`✅ User ${userId} authenticated`);
        
        // Send authentication success
        socket.send(JSON.stringify({
          type: 'authenticated',
          userId,
          timestamp: new Date().toISOString(),
        }));
        
        return;
      }
      
      // Require authentication for all other messages
      if (!authenticated || !userId) {
        socket.send(JSON.stringify({
          type: 'error',
          reason: 'not_authenticated',
          message: 'You must authenticate before sending messages',
        }));
        return;
      }
      
      try {
        handleMessage(socket, userId, message);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          reason: 'internal_error',
          message: 'Failed to process message',
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        reason: 'invalid_json',
        message: 'Malformed message payload',
        timestamp: new Date().toISOString(),
      }));
    }
  };
  
  socket.onclose = () => {
    if (userId) {
      console.log(`❌ User ${userId} disconnected`);
      userConnections.delete(userId);
      
      // Remove from all rooms
      rooms.forEach((members) => {
        members.delete(socket);
      });
    } else {
      console.log('❌ Unauthenticated connection closed');
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return response;
});

// ============================================================================
// WebSocket Message Handlers
// ============================================================================

function handleMessage(socket: WebSocket, userId: string, message: any) {
  const { type, ...data } = message;
  
  switch (type) {
    case 'join_room':
      joinRoom(socket, userId, data.room);
      break;
      
    case 'leave_room':
      leaveRoom(socket, data.room);
      break;
      
    case 'broadcast':
      broadcastToRoom(data.room, {
        type: 'broadcast',
        userId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
      break;
      
    case 'direct_message':
      sendDirectMessage(userId, data.targetUserId, data.content);
      break;
      
    case 'accessibility_update':
      handleAccessibilityUpdate(userId, data.preferences);
      break;
      
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong' }));
      break;
      
    default:
      console.log(`Unknown message type: ${type}`);
  }
}

function joinRoom(socket: WebSocket, userId: string, roomName: string) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  
  rooms.get(roomName)!.add(socket);
  
  console.log(`User ${userId} joined room ${roomName}`);
  
  // Notify user
  socket.send(JSON.stringify({
    type: 'room_joined',
    room: roomName,
    memberCount: rooms.get(roomName)!.size,
  }));
  
  // Notify other room members
  broadcastToRoom(roomName, {
    type: 'user_joined',
    userId,
    room: roomName,
  }, socket);
}

function leaveRoom(socket: WebSocket, roomName: string) {
  const room = rooms.get(roomName);
  if (room) {
    room.delete(socket);
    
    if (room.size === 0) {
      rooms.delete(roomName);
    }
    
    console.log(`User left room ${roomName}`);
  }
}

function broadcastToRoom(roomName: string, message: any, excludeSocket?: WebSocket) {
  const room = rooms.get(roomName);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  
  room.forEach((socket) => {
    if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr);
    }
  });
}

function sendDirectMessage(fromUserId: string, toUserId: string, content: any) {
  const targetSocket = userConnections.get(toUserId);
  
  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify({
      type: 'direct_message',
      fromUserId,
      content,
      timestamp: new Date().toISOString(),
    }));
  }
}

async function handleAccessibilityUpdate(userId: string, preferences: any) {
  // Store preferences in database
  await supabase
    .from('user_accessibility_preferences')
    .upsert({
      user_id: userId,
      preferences,
      updated_at: new Date().toISOString(),
    });
  
  console.log(`Updated accessibility preferences for user ${userId}`);
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractUserIdFromToken(token: string): string | null {
  // Simplified token extraction - in production, verify with DeafAUTH
  try {
    // This is a placeholder - implement proper JWT verification
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId;
  } catch {
    return null;
  }
}

await app.listen({ port: 8004 });
