import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProfilePage } from "@/modules/provider-profile";

const profileSearchSchema = z.object({
  userId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/_app/profile/")({
  validateSearch: profileSearchSchema,
  component: ProfilePage,
});
