export const endpoints = {
  auth: { login: "/login", register: "/register", logout: "/logout", me: "/me" },
  account: { profile: "/me" },
  sessions: { list: "/sessions" },
  reservations: { list: "/reservations" },
} as const;
