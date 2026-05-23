const todoKeys = {
  all: ["todos"] as const,
  query: {
    list: () => [...todoKeys.all, "list"] as const,
    detail: (id: string) => [...todoKeys.all, "detail", id] as const,
  },
  mutation: {
    create: () => [...todoKeys.all, "create"] as const,
    update: () => [...todoKeys.all, "update"] as const,
    remove: () => [...todoKeys.all, "delete"] as const,
  },
} as const;

export default todoKeys;
