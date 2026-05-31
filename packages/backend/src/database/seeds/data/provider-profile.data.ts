export const PROVIDER_PROFILE_USER_EMAIL = "provider@ems.local";

export const PROVIDER_PROFILE_DEFAULTS = {
  bio: "Experienced full-stack engineer specializing in Node.js and cloud networking",
  latitude: 40.7128,
  longitude: -74.006,
  isAvailable: true,
  hourlyRateMin: 75,
  hourlyRateMax: 150,
  verificationStatus: "unverified",
} as const;

export const PROVIDER_PROFILE_SKILLS: Array<{
  name: string;
  level: "junior" | "mid" | "senior" | "expert";
  yearsOfExperience: number;
}> = [
  { name: "Node.js", level: "senior", yearsOfExperience: 8 },
  { name: "TypeScript", level: "senior", yearsOfExperience: 6 },
  { name: "TCP/IP Fundamentals", level: "mid", yearsOfExperience: 5 },
];
