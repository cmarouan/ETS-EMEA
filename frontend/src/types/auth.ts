export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}
