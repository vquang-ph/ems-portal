const providerProfileKeys = {
  all: ["provider-profile"] as const,
  query: {
    me: () => [...providerProfileKeys.all, "me"] as const,
    byUser: (userId: string) =>
      [...providerProfileKeys.all, "byUser", userId] as const,
    categories: () => [...providerProfileKeys.all, "skill-categories"] as const,
    skills: (categoryId?: number) =>
      [...providerProfileKeys.all, "skills", categoryId ?? "all"] as const,
  },
  mutation: {
    create: () => [...providerProfileKeys.all, "create"] as const,
    update: () => [...providerProfileKeys.all, "update"] as const,
    publish: () => [...providerProfileKeys.all, "publish"] as const,
    addSkill: () => [...providerProfileKeys.all, "add-skill"] as const,
    removeSkill: () => [...providerProfileKeys.all, "remove-skill"] as const,
  },
} as const;

export default providerProfileKeys;
