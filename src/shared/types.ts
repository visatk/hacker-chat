export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserSessionData {
  sessionId: string;
  visitCount: number;
}
