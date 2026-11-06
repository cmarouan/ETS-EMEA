export const endpoints = {
  auth: { login: "/login" },
  account: { profile: "/account" },
  sessions: { list: "/sessions" },
  reservations: { list: "/reservations" },
} as const;
