import { User, UserRole } from '../types';

export interface SystemHealthData {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  systemName: string;
  environment: string;
  serverTimestamp: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  totalRequests: number;
  totalTokenRefreshes: number;
  syntheticPingCount: number;
  services: {
    database: {
      name: string;
      status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL';
      connectionState: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
      poolSize: number;
      activeConnections: number;
      pingLatencyMs: number;
      totalRecords: number;
      readThroughputPerSec: number;
      writeThroughputPerSec: number;
      integrityCheck: string;
    };
    aiInference: {
      name: string;
      status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL';
      provider: string;
      modelTarget: string;
      gatewayStatus: 'ONLINE' | 'STANDBY' | 'OFFLINE';
      lastInferenceLatencyMs: number;
      avgInferenceLatencyMs: number;
      confidenceThreshold: number;
      tokenQuotaStatus: string;
      quotaRemainingPct: number;
      activeWorkers: number;
    };
    sessionValidation: {
      name: string;
      status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL';
      activeSessionsCount: number;
      autoRefreshesLastHour: number;
      expertOfficerActiveSessions: number;
      roleBreakdown: Record<UserRole, number>;
      tokenLifespanMins: number;
      expertMaxSlidingHours: number;
      avgValidationLatencyMs: number;
      securityEnforcement: string;
    };
    weatherMicroclimate: {
      name: string;
      status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL';
      syncedDistricts: string[];
      pingLatencyMs: number;
      cacheHitRatePct: number;
      lastSyncedAt: string;
    };
    storageEngine: {
      name: string;
      status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL';
      diskUsageMb: number;
      cacheBufferMb: number;
      iopsWriteLatencyMs: number;
    };
  };
  systemMetrics: {
    memoryRssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    nodeVersion: string;
    platform: string;
    cpuLoadPct: number;
  };
}

export interface EndpointMetricItem {
  path: string;
  method: string;
  totalCalls: number;
  errorCalls: number;
  lastStatusCode: number;
  lastLatencyMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  latencies: number[];
  lastCalledAt: string;
}

export interface ActiveSessionItem {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  email: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  secondsUntilExpiry: number;
  refreshCount: number;
  ip: string;
  userAgent: string;
  isHighPrioritySession: boolean;
}

const TOKEN_STORAGE_KEY = 'cultivai_auth_token';
const SESSION_ID_KEY = 'cultivai_session_id';
const REFRESH_TOKEN_KEY = 'cultivai_refresh_token';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  endpoint: string;
  options: RequestInit;
}

// ----------------------------------------------------------------------------
// AUTOMATIC JWT TOKEN REFRESH & FETCH/AXIOS INTERCEPTOR LAYER
// ----------------------------------------------------------------------------
class ApiService {
  private currentToken: string | null = null;
  private currentSessionId: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: PendingRequest[] = [];
  private heartbeatTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      this.currentSessionId = localStorage.getItem(SESSION_ID_KEY);
      this.startHeartbeat();
    }
  }

  public getToken(): string | null {
    return this.currentToken;
  }

  public getSessionId(): string | null {
    return this.currentSessionId;
  }

  public setToken(token: string | null, sessionId?: string) {
    this.currentToken = token;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (sessionId) {
        this.currentSessionId = sessionId;
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }
      this.startHeartbeat();
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      this.currentSessionId = null;
      this.stopHeartbeat();
    }
  }

  // Intercept response headers to capture automatic sliding token renewal
  private handleResponseHeaders(res: Response) {
    const refreshedToken = res.headers.get('x-refreshed-token');
    const sessionId = res.headers.get('x-session-id') || this.currentSessionId || undefined;

    if (refreshedToken && refreshedToken !== this.currentToken) {
      console.log('[CultivAI API Interceptor] Automatic JWT renewal intercepted seamlessly:', refreshedToken.slice(0, 20) + '...');
      this.setToken(refreshedToken, sessionId);
    }
  }

  // Process queued requests after token refresh succeeds or fails
  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        // Retry original request with newly refreshed token
        const newOptions = { ...prom.options };
        const headers = new Headers(newOptions.headers || {});
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
          headers.set('x-session-token', token);
        }
        newOptions.headers = headers;
        this.request(prom.endpoint, newOptions)
          .then(prom.resolve)
          .catch(prom.reject);
      }
    });
    this.failedQueue = [];
  }

  // Explicit Token Refresh with Promise deduplication
  public async refreshToken(): Promise<string> {
    if (!this.currentToken) {
      throw new Error('No active token to refresh');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentToken}`,
          'x-session-token': this.currentToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      const data = await response.json();
      const newToken = data.token || response.headers.get('x-refreshed-token');

      if (!newToken) {
        throw new Error('No refreshed token received from server');
      }

      this.setToken(newToken, data.sessionId || this.currentSessionId || undefined);
      return newToken;
    } catch (err) {
      console.warn('[CultivAI API] Automatic token refresh failed:', err);
      throw err;
    }
  }

  // Proactive Session Heartbeat: Ensures long sessions for Experts & Officers never drop
  private startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    // Ping session health every 4 minutes while user is active
    this.heartbeatTimer = setInterval(async () => {
      if (this.currentToken && typeof window !== 'undefined') {
        try {
          await this.request('/api/auth/session');
        } catch {
          // Handled transparently by request interceptor
        }
      }
    }, 4 * 60 * 1000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Core Request Method with Full Request/Response Interceptor & Queueing Pipeline
  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});

    // REQUEST INTERCEPTOR: Attach Bearer token
    if (this.currentToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.currentToken}`);
      headers.set('x-session-token', this.currentToken);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      // RESPONSE INTERCEPTOR: Capture automatic token refresh headers
      this.handleResponseHeaders(response);

      // RESPONSE INTERCEPTOR: Handle 401 Unauthorized (Token Expiration)
      if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
        if (this.isRefreshing) {
          // Token is already refreshing, enqueue this request
          return new Promise<T>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, endpoint, options });
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.isRefreshing = false;
          this.processQueue(null, newToken);

          // Retry the current request with refreshed token
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          retryHeaders.set('x-session-token', newToken);

          const retryResponse = await fetch(endpoint, {
            ...options,
            headers: retryHeaders,
          });

          this.handleResponseHeaders(retryResponse);

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
            throw new Error(errorData.message || errorData.error || `HTTP ${retryResponse.status}`);
          }

          return await retryResponse.json();
        } catch (refreshErr: any) {
          this.isRefreshing = false;
          this.processQueue(refreshErr, null);
          throw refreshErr;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[API Interceptor] Request failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION APIS
  // --------------------------------------------------------------------------
  public async login(emailOrPhone: string, password: string, role: UserRole): Promise<{
    success: boolean;
    user: User;
    token: string;
    sessionId: string;
    expiresIn: number;
    maxSlidingHours: number;
  }> {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password, role }),
    });

    if (data.token) {
      this.setToken(data.token, data.sessionId);
    }
    return data;
  }

  public async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.request('/api/auth/logout', { method: 'POST' });
      this.setToken(null);
      return res;
    } catch {
      this.setToken(null);
      return { success: true, message: 'Logged out locally' };
    }
  }

  public async getSession(): Promise<{
    success: boolean;
    authenticated: boolean;
    user: User;
    session: any;
    refreshedToken: string | null;
  }> {
    return this.request('/api/auth/session');
  }

  // --------------------------------------------------------------------------
  // SYSTEM HEALTH & DIAGNOSTIC APIS
  // --------------------------------------------------------------------------
  public async getSystemHealth(): Promise<SystemHealthData> {
    return this.request<SystemHealthData>('/api/health');
  }

  public async getEndpointMetrics(): Promise<{ timestamp: string; totalEndpointsTracked: number; endpoints: EndpointMetricItem[] }> {
    return this.request('/api/health/endpoints');
  }

  public async pingTest(target: string = 'all'): Promise<{
    success: boolean;
    target: string;
    latencyMs: number;
    timestamp: string;
    status: string;
    details: any;
  }> {
    return this.request('/api/health/test-ping', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
  }

  public async getActiveSessions(): Promise<{ success: boolean; totalActiveSessions: number; sessions: ActiveSessionItem[] }> {
    return this.request('/api/admin/sessions');
  }

  public async revokeAdminSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/admin/sessions/revoke', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  public async pingTimestamp(): Promise<{ status: string; timestamp: number; hrTime: string; uptimeSeconds: number }> {
    return this.request('/api/health/ping');
  }

  // --------------------------------------------------------------------------
  // DOMAIN REST APIS (CASES, FIELDS, ALERTS, INSPECTIONS, SAMPLES, AI)
  // --------------------------------------------------------------------------

  public async getCases(params: Record<string, string> = {}): Promise<{ success: boolean; count: number; cases: any[] }> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/cases${query ? `?${query}` : ''}`);
  }

  public async getCase(id: string): Promise<{ success: boolean; case: any }> {
    return this.request(`/api/cases/${id}`);
  }

  public async createCase(caseData: any): Promise<{ success: boolean; case: any }> {
    return this.request('/api/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  public async reviewCase(id: string, reviewData: any): Promise<{ success: boolean; case: any }> {
    return this.request(`/api/cases/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  public async submitFollowUp(id: string, followUpData: any): Promise<{ success: boolean; case: any }> {
    return this.request(`/api/cases/${id}/follow-up`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
  }

  public async getFields(farmerId?: string): Promise<{ success: boolean; count: number; fields: any[] }> {
    const q = farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : '';
    return this.request(`/api/fields${q}`);
  }

  public async createField(fieldData: any): Promise<{ success: boolean; field: any }> {
    return this.request('/api/fields', {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  }

  public async updateField(id: string, fieldData: any): Promise<{ success: boolean; field: any }> {
    return this.request(`/api/fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fieldData),
    });
  }

  public async deleteField(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/fields/${id}`, { method: 'DELETE' });
  }

  public async getAlerts(role?: string, userId?: string): Promise<{ success: boolean; count: number; alerts: any[] }> {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (userId) params.set('userId', userId);
    const q = params.toString();
    return this.request(`/api/alerts${q ? `?${q}` : ''}`);
  }

  public async broadcastAlert(alertData: any): Promise<{ success: boolean; alert: any }> {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  public async getInspections(): Promise<{ success: boolean; count: number; visits: any[] }> {
    return this.request('/api/inspections');
  }

  public async scheduleInspection(inspectionData: any): Promise<{ success: boolean; visit: any }> {
    return this.request('/api/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  public async updateInspection(id: string, inspectionData: any): Promise<{ success: boolean; visit: any }> {
    return this.request(`/api/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inspectionData),
    });
  }

  public async getSamples(): Promise<{ success: boolean; count: number; samples: any[] }> {
    return this.request('/api/samples');
  }

  public async requestSample(sampleData: any): Promise<{ success: boolean; sample: any }> {
    return this.request('/api/samples', {
      method: 'POST',
      body: JSON.stringify(sampleData),
    });
  }

  public async updateSample(id: string, sampleData: any): Promise<{ success: boolean; sample: any }> {
    return this.request(`/api/samples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sampleData),
    });
  }

  public async getMessages(): Promise<{ success: boolean; count: number; messages: any[] }> {
    return this.request('/api/messages');
  }

  public async sendMessage(messageData: any): Promise<{ success: boolean; message: any }> {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  public async getHotspots(): Promise<{ success: boolean; count: number; hotspots: any[] }> {
    return this.request('/api/surveillance/clusters');
  }

  public async getKnowledge(search?: string): Promise<{ success: boolean; count: number; articles: any[] }> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/knowledge${q}`);
  }

  public async getWeather(): Promise<{ success: boolean; count: number; stations: any[] }> {
    return this.request('/api/weather/microclimate');
  }

  public async getUsers(): Promise<{ success: boolean; count: number; users: any[] }> {
    return this.request('/api/admin/users');
  }

  public async createUser(userData: any): Promise<{ success: boolean; user: any }> {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  public async updateUser(id: string, userData: any): Promise<{ success: boolean; user: any }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  public async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  }

  public async getAuditLogs(): Promise<{ success: boolean; count: number; logs: any[] }> {
    return this.request('/api/admin/audit-logs');
  }

  public async diagnoseCrop(crop: string, symptoms: string, image?: string): Promise<{ success: boolean; source: string; diagnosis: any }> {
    return this.request('/api/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify({ crop, symptoms, image }),
    });
  }

  public async askCopilot(question: string, role: string, crop?: string, location?: string): Promise<{ success: boolean; source: string; answer: string }> {
    return this.request('/api/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({ question, role, crop, location }),
    });
  }

  // --- Settings Endpoints ---
  public async getUserSettings(): Promise<{ success: boolean; settings: any }> {
    return this.request('/api/settings/me');
  }

  public async updateUserSettings(data: any): Promise<{ success: boolean; settings: any }> {
    return this.request('/api/settings/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getNotificationPreferences(): Promise<{ success: boolean; notifications: any }> {
    return this.request('/api/settings/notifications');
  }

  public async updateNotificationPreferences(data: any): Promise<{ success: boolean; notifications: any }> {
    return this.request('/api/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getPrivacyPreferences(): Promise<{ success: boolean; privacy: any }> {
    return this.request('/api/settings/privacy');
  }

  public async updatePrivacyPreferences(data: any): Promise<{ success: boolean; privacy: any }> {
    return this.request('/api/settings/privacy', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getSecuritySessions(): Promise<{ success: boolean; sessions: any[] }> {
    return this.request('/api/settings/sessions');
  }

  public async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/settings/sessions/${sessionId}`, { method: 'DELETE' });
  }

  public async changePassword(data: { currentPassword?: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    return this.request('/api/settings/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateFarmerProfile(data: any): Promise<{ success: boolean; user: User; message?: string }> {
    return this.request('/api/farmer/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async updateExpertProfile(data: any): Promise<{ success: boolean; user: User; message?: string }> {
    return this.request('/api/expert/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getFarmerPreferences(): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/farmer-prefs');
  }

  public async updateFarmerPreferences(data: any): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/farmer-prefs', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getExpertPreferences(): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/expert-prefs');
  }

  public async updateExpertPreferences(data: any): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/expert-prefs', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getOfficerPreferences(): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/officer-prefs');
  }

  public async updateOfficerPreferences(data: any): Promise<{ success: boolean; preferences: any }> {
    return this.request('/api/settings/officer-prefs', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getAdminPlatformSettings(): Promise<{ success: boolean; settings: any }> {
    return this.request('/api/admin/settings');
  }

  public async updateAdminPlatformSettings(data: any, section?: string): Promise<{ success: boolean; settings: any }> {
    const url = section ? `/api/admin/settings?section=${section}` : '/api/admin/settings';
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async testEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/admin/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ recipient }),
    });
  }
}

export const API = new ApiService();
