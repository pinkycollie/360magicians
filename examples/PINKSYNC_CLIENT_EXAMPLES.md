# PinkSync Client SDK Examples

## Security Note

🔒 **Secure Authentication**: PinkSync uses a secure handshake-based authentication system. Tokens are never sent in URL query parameters to prevent exposure in logs. Authentication occurs via WebSocket messages after connection establishment.

## Installation

```bash
# Copy the client files to your project
cp shared/pinksync-client.ts src/lib/
cp shared/pinksync-react.tsx src/lib/  # If using React
```

## Example 1: Vanilla JavaScript

```javascript
import { PinkSyncClient } from './lib/pinksync-client';

// Initialize client
const client = new PinkSyncClient({
  token: 'your-jwt-token',
  baseUrl: 'wss://sync.360magicians.com',
  autoReconnect: true,
  reconnectDelay: 3000,
});

// Connect
await client.connect();

// Join a room
client.joinRoom('accessibility-alerts');

// Listen for messages
client.on('message', (data) => {
  console.log('Message received:', data);
});

// Listen for specific events
client.on('accessibility_alert', (alert) => {
  console.log('🔔 New alert:', alert);
  showVisualNotification(alert.message);
});

// Broadcast to room
client.broadcast('accessibility-alerts', {
  message: 'New accessibility feature available!',
  type: 'feature_announcement',
  timestamp: new Date().toISOString(),
});

// Send direct message
client.sendDirectMessage('user-123', {
  message: 'Hello!',
  isAccessible: true,
});

// Update accessibility preferences
client.updateAccessibilityPreferences({
  visualAlerts: true,
  captionsEnabled: true,
  aslPreferred: true,
  highContrast: true,
});

// Check connection status
console.log('Connected:', client.connected);

// Ping server
client.ping();

// Get stats
const stats = await client.getStats();
console.log('Server stats:', stats);

// Disconnect when done
client.disconnect();
```

## Example 2: React Component with Hook

```tsx
import React, { useEffect, useState } from 'react';
import { usePinkSync } from './lib/pinksync-react';

function AccessibilityDashboard() {
  const { 
    connected, 
    joinRoom, 
    leaveRoom,
    broadcast, 
    updateAccessibilityPreferences,
    client,
    error,
  } = usePinkSync({
    token: localStorage.getItem('auth_token') || '',
    enabled: true,
  });
  
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState(['accessibility-alerts']);
  
  useEffect(() => {
    if (!client) return;
    
    // Join rooms
    rooms.forEach(room => joinRoom(room));
    
    // Listen for accessibility alerts
    const unsubscribeAlert = client.on('accessibility_alert', (alert) => {
      setMessages(prev => [...prev, { ...alert, timestamp: Date.now() }]);
      
      // Show visual notification (Deaf-first design)
      showVisualAlert(alert.message);
    });
    
    // Listen for broadcast messages
    const unsubscribeBroadcast = client.on('broadcast', (data) => {
      console.log('Broadcast received:', data);
      setMessages(prev => [...prev, data]);
    });
    
    // Listen for direct messages
    const unsubscribeDM = client.on('direct_message', (dm) => {
      console.log('Direct message:', dm);
      showDirectMessage(dm);
    });
    
    return () => {
      unsubscribeAlert();
      unsubscribeBroadcast();
      unsubscribeDM();
    };
  }, [client, rooms, joinRoom]);
  
  const sendUpdate = () => {
    broadcast('accessibility-alerts', {
      message: 'Testing real-time updates',
      timestamp: new Date().toISOString(),
      userId: 'current-user-id',
    });
  };
  
  const toggleAccessibility = (feature: string, enabled: boolean) => {
    updateAccessibilityPreferences({
      [feature]: enabled,
    });
  };
  
  if (error) {
    return (
      <div className="error-container">
        <p>❌ Connection error: {error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      {/* Connection Status */}
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      {/* Controls */}
      <div className="controls">
        <button onClick={sendUpdate} disabled={!connected}>
          Send Test Message
        </button>
        
        <button onClick={() => joinRoom('new-room')} disabled={!connected}>
          Join New Room
        </button>
      </div>
      
      {/* Accessibility Toggles */}
      <div className="accessibility-controls">
        <h3>♿ Accessibility Preferences</h3>
        <label>
          <input 
            type="checkbox" 
            onChange={(e) => toggleAccessibility('visualAlerts', e.target.checked)}
          />
          Visual Alerts
        </label>
        <label>
          <input 
            type="checkbox" 
            onChange={(e) => toggleAccessibility('captionsEnabled', e.target.checked)}
          />
          Captions
        </label>
        <label>
          <input 
            type="checkbox" 
            onChange={(e) => toggleAccessibility('aslPreferred', e.target.checked)}
          />
          ASL Preferred
        </label>
      </div>
      
      {/* Messages */}
      <div className="messages">
        <h3>📨 Messages ({messages.length})</h3>
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.type || 'Message'}:</strong> {msg.message || JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function for visual alerts (Deaf-first)
function showVisualAlert(message: string) {
  // Create visual notification
  const notification = document.createElement('div');
  notification.className = 'visual-alert';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate
  notification.style.animation = 'slideIn 0.3s ease-out';
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function showDirectMessage(dm: any) {
  // Show direct message with visual indicator
  const dmElement = document.createElement('div');
  dmElement.className = 'direct-message-notification';
  dmElement.innerHTML = `
    <div class="dm-icon">💬</div>
    <div class="dm-content">${dm.content?.message || 'New message'}</div>
  `;
  document.body.appendChild(dmElement);
  
  setTimeout(() => dmElement.remove(), 3000);
}

export default AccessibilityDashboard;
```

## Example 3: Vue Component

```vue
<template>
  <div class="dashboard">
    <!-- Connection Status -->
    <div :class="['status', connected ? 'connected' : 'disconnected']">
      {{ connected ? '🟢 Connected' : '🔴 Disconnected' }}
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <button @click="sendUpdate" :disabled="!connected">
        Send Test Message
      </button>
    </div>
    
    <!-- Messages -->
    <div class="messages">
      <h3>📨 Messages ({{ messages.length }})</h3>
      <div v-for="(msg, i) in messages" :key="i" class="message">
        <strong>{{ msg.type || 'Message' }}:</strong> 
        {{ msg.message || JSON.stringify(msg) }}
      </div>
    </div>
    
    <!-- Accessibility Controls -->
    <div class="accessibility-controls">
      <h3>♿ Accessibility Preferences</h3>
      <label>
        <input 
          type="checkbox" 
          v-model="preferences.visualAlerts"
          @change="updatePreferences"
        />
        Visual Alerts
      </label>
      <label>
        <input 
          type="checkbox" 
          v-model="preferences.captionsEnabled"
          @change="updatePreferences"
        />
        Captions
      </label>
      <label>
        <input 
          type="checkbox" 
          v-model="preferences.aslPreferred"
          @change="updatePreferences"
        />
        ASL Preferred
      </label>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { PinkSyncClient } from './lib/pinksync-client';

export default {
  setup() {
    const client = ref(null);
    const connected = ref(false);
    const messages = ref([]);
    const preferences = ref({
      visualAlerts: true,
      captionsEnabled: true,
      aslPreferred: true,
    });
    
    onMounted(async () => {
      // Initialize client
      client.value = new PinkSyncClient({
        token: localStorage.getItem('auth_token'),
        baseUrl: 'wss://sync.360magicians.com',
        autoReconnect: true,
      });
      
      // Setup event listeners
      client.value.on('connected', () => {
        connected.value = true;
        client.value.joinRoom('accessibility-alerts');
      });
      
      client.value.on('disconnected', () => {
        connected.value = false;
      });
      
      client.value.on('accessibility_alert', (alert) => {
        messages.value.push(alert);
        showVisualAlert(alert.message);
      });
      
      client.value.on('broadcast', (data) => {
        messages.value.push(data);
      });
      
      // Connect
      await client.value.connect();
    });
    
    onUnmounted(() => {
      client.value?.disconnect();
    });
    
    const sendUpdate = () => {
      client.value?.broadcast('accessibility-alerts', {
        message: 'Testing from Vue',
        timestamp: new Date().toISOString(),
      });
    };
    
    const updatePreferences = () => {
      client.value?.updateAccessibilityPreferences(preferences.value);
    };
    
    return { 
      connected, 
      messages, 
      preferences,
      sendUpdate,
      updatePreferences,
    };
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.status {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.status.connected {
  background: #d4edda;
  color: #155724;
}

.status.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.messages {
  margin-top: 20px;
}

.message {
  padding: 10px;
  margin: 5px 0;
  background: #f8f9fa;
  border-left: 3px solid #007bff;
}

.accessibility-controls {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 5px;
}

.accessibility-controls label {
  display: block;
  margin: 10px 0;
}
</style>
```

## Example 4: Angular Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PinkSyncClient } from './lib/pinksync-client';

@Component({
  selector: 'app-accessibility-dashboard',
  template: `
    <div class="dashboard">
      <div [class]="'status ' + (connected ? 'connected' : 'disconnected')">
        {{ connected ? '🟢 Connected' : '🔴 Disconnected' }}
      </div>
      
      <button (click)="sendUpdate()" [disabled]="!connected">
        Send Test Message
      </button>
      
      <div class="messages">
        <h3>📨 Messages ({{ messages.length }})</h3>
        <div *ngFor="let msg of messages" class="message">
          <strong>{{ msg.type || 'Message' }}:</strong> 
          {{ msg.message || (msg | json) }}
        </div>
      </div>
      
      <div class="accessibility-controls">
        <h3>♿ Accessibility Preferences</h3>
        <label>
          <input 
            type="checkbox" 
            [(ngModel)]="preferences.visualAlerts"
            (change)="updatePreferences()"
          />
          Visual Alerts
        </label>
        <label>
          <input 
            type="checkbox" 
            [(ngModel)]="preferences.captionsEnabled"
            (change)="updatePreferences()"
          />
          Captions
        </label>
      </div>
    </div>
  `
})
export class AccessibilityDashboardComponent implements OnInit, OnDestroy {
  private client: PinkSyncClient | null = null;
  connected = false;
  messages: any[] = [];
  preferences = {
    visualAlerts: true,
    captionsEnabled: true,
    aslPreferred: true,
  };
  
  async ngOnInit() {
    this.client = new PinkSyncClient({
      token: localStorage.getItem('auth_token') || '',
      baseUrl: 'wss://sync.360magicians.com',
      autoReconnect: true,
    });
    
    this.client.on('connected', () => {
      this.connected = true;
      this.client?.joinRoom('accessibility-alerts');
    });
    
    this.client.on('disconnected', () => {
      this.connected = false;
    });
    
    this.client.on('accessibility_alert', (alert) => {
      this.messages.push(alert);
    });
    
    await this.client.connect();
  }
  
  ngOnDestroy() {
    this.client?.disconnect();
  }
  
  sendUpdate() {
    this.client?.broadcast('accessibility-alerts', {
      message: 'Testing from Angular',
      timestamp: new Date().toISOString(),
    });
  }
  
  updatePreferences() {
    this.client?.updateAccessibilityPreferences(this.preferences);
  }
}
```

## Example 5: Svelte Component

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { PinkSyncClient } from './lib/pinksync-client';
  
  let client;
  let connected = false;
  let messages = [];
  let preferences = {
    visualAlerts: true,
    captionsEnabled: true,
    aslPreferred: true,
  };
  
  onMount(async () => {
    client = new PinkSyncClient({
      token: localStorage.getItem('auth_token'),
      baseUrl: 'wss://sync.360magicians.com',
      autoReconnect: true,
    });
    
    client.on('connected', () => {
      connected = true;
      client.joinRoom('accessibility-alerts');
    });
    
    client.on('disconnected', () => {
      connected = false;
    });
    
    client.on('accessibility_alert', (alert) => {
      messages = [...messages, alert];
    });
    
    await client.connect();
  });
  
  onDestroy(() => {
    client?.disconnect();
  });
  
  function sendUpdate() {
    client?.broadcast('accessibility-alerts', {
      message: 'Testing from Svelte',
      timestamp: new Date().toISOString(),
    });
  }
  
  function updatePreferences() {
    client?.updateAccessibilityPreferences(preferences);
  }
</script>

<div class="dashboard">
  <div class="status" class:connected>
    {connected ? '🟢 Connected' : '🔴 Disconnected'}
  </div>
  
  <button on:click={sendUpdate} disabled={!connected}>
    Send Test Message
  </button>
  
  <div class="messages">
    <h3>📨 Messages ({messages.length})</h3>
    {#each messages as msg, i (i)}
      <div class="message">
        <strong>{msg.type || 'Message'}:</strong> {msg.message}
      </div>
    {/each}
  </div>
  
  <div class="accessibility-controls">
    <h3>♿ Accessibility Preferences</h3>
    <label>
      <input 
        type="checkbox" 
        bind:checked={preferences.visualAlerts}
        on:change={updatePreferences}
      />
      Visual Alerts
    </label>
    <label>
      <input 
        type="checkbox" 
        bind:checked={preferences.captionsEnabled}
        on:change={updatePreferences}
      />
      Captions
    </label>
  </div>
</div>

<style>
  .dashboard {
    padding: 20px;
  }
  
  .status {
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    background: #f8d7da;
    color: #721c24;
  }
  
  .status.connected {
    background: #d4edda;
    color: #155724;
  }
  
  .message {
    padding: 10px;
    margin: 5px 0;
    background: #f8f9fa;
    border-left: 3px solid #007bff;
  }
</style>
```

## CSS for Visual Notifications (Deaf-First Design)

```css
/* Visual Alert Animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.visual-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  max-width: 400px;
  font-size: 16px;
  font-weight: 500;
}

.direct-message-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

.dm-icon {
  font-size: 24px;
}

.dm-content {
  font-size: 14px;
  color: #333;
}
```

## Advanced Features

### Custom Event Listeners

```javascript
// Listen for specific user events
client.on('user_joined', ({ userId, username }) => {
  console.log(`${username} joined the room`);
  showVisualNotification(`${username} joined`);
});

client.on('user_left', ({ userId, username }) => {
  console.log(`${username} left the room`);
});

// Listen for typing indicators
client.on('typing_start', ({ userId, roomName }) => {
  showTypingIndicator(userId, roomName);
});

client.on('typing_stop', ({ userId }) => {
  hideTypingIndicator(userId);
});
```

### Error Handling

```javascript
client.on('error', ({ error }) => {
  console.error('PinkSync error:', error);
  
  // Show user-friendly error message
  showErrorMessage('Connection lost. Reconnecting...');
});

client.on('disconnected', () => {
  // Handle disconnection
  showWarningMessage('Disconnected from server');
});

client.on('reconnected', () => {
  // Handle reconnection
  showSuccessMessage('Reconnected successfully!');
});
```

### Debug Mode

```javascript
// Enable debug mode
window.PINKSYNC_DEBUG = true;

// Now all messages will be logged to console
```

## Best Practices

1. **Always handle disconnections gracefully**
2. **Use visual indicators for all events (Deaf-first)**
3. **Implement auto-reconnect with exponential backoff**
4. **Clean up event listeners when components unmount**
5. **Provide visual feedback for all user actions**
6. **Test with screen readers and accessibility tools**
7. **Use meaningful event names**
8. **Validate messages before sending**
9. **Implement rate limiting on client side**
10. **Log important events for debugging**
