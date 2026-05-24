const authKeys = {
  all: ["auth"] as const,
  query: {
    me: () => [...authKeys.all, "me"] as const,
  },
  mutation: {
    login: () => [...authKeys.all, "login"] as const,
    register: () => [...authKeys.all, "register"] as const,
    logout: () => [...authKeys.all, "logout"] as const,
  },
} as const;

export default authKeys;
