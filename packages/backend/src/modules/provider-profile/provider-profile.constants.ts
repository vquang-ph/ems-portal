// Module-scoped constants for provider-profile

/**
 * Fields a provider must populate before the profile can transition
 * from `draft` to `active`. The publish endpoint validates against this list
 * (plus at least one provider skill) before flipping `profile_status`.
 */
export const PROVIDER_PROFILE_REQUIRED_FIELDS = [
  "bio",
  "latitude",
  "longitude",
  "hourlyRateMin",
  "hourlyRateMax",
] as const;

export type ProviderProfileRequiredField =
  (typeof PROVIDER_PROFILE_REQUIRED_FIELDS)[number];
