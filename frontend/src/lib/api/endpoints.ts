export const endpoints = {
  auth: { login: "/login", register: "/register", logout: "/logout", me: "/me" },
  account: { profile: "/me" },
  sessions: {
    list: "/sessions",
    byId: (id: string) => `/sessions/${id}`,
  },
  reservations: {
    list: "/reservations",
    byId: (id: string) => `/reservations/${id}`,
  },
} as const;
