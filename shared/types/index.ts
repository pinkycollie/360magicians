// Shared TypeScript types for MBTQ Edge Functions

export interface User {
  id: string;
  email: string;
  trustScore: number;
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface ApiLogEntry {
  path: string;
  method: string;
  duration_ms: number;
  region: string;
  timestamp: string;
}

export interface TrustScore {
  user_id: string;
  score: number;
  last_updated: string;
}

export interface FibonroseEvent {
  event: string;
  user_id: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AIRequest {
  prompt: string;
  role?: string;
  model?: string;
}

export interface AIResponse {
  response: string;
  model: string;
  region: string;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  region: string;
  timestamp: string;
}
