export const endpoints = {
  auth: { login: "/login", logout: "/logout", me: "/me" },
  account: { profile: "/account" },
  sessions: { list: "/sessions" },
  reservations: { list: "/reservations" },
} as const;
