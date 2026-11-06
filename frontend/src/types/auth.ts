export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
