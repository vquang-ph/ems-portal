import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import type { UpdateProviderProfile } from "@ems-portal/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileForm from "../components/ProfileForm";
import useCreateProfileMutation from "../hooks/mutations/useCreateProfileMutation";
import useUpdateProfileMutation from "../hooks/mutations/useUpdateProfileMutation";
import useMyProfileQuery from "../hooks/queries/useMyProfileQuery";

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useMyProfileQuery();

  const createMutation = useCreateProfileMutation();
  const updateMutation = useUpdateProfileMutation();

  // Treat 404 as "no profile yet" → create mode.
  const missingProfile = isAxiosError(error) && error.response?.status === 404;
  const isEditMode = !!profile && !missingProfile;
  const activeMutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = (data: UpdateProviderProfile) => {
    if (isEditMode) {
      updateMutation.mutate(data, {
        onSuccess: () => void navigate({ to: "/profile" }),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => void navigate({ to: "/profile" }),
      });
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit your profile" : "Set up your profile"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your bio, rates, and availability."
              : "Tell clients about your experience to start getting matched."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={
              isEditMode && profile
                ? {
                    bio: profile.bio,
                    hourlyRateMin: profile.hourlyRateMin,
                    hourlyRateMax: profile.hourlyRateMax,
                    isAvailable: profile.isAvailable,
                    latitude: profile.latitude,
                    longitude: profile.longitude,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={activeMutation.isPending}
            submitLabel={isEditMode ? "Save changes" : "Create profile"}
          />
          {activeMutation.error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              Could not save profile. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetupPage;
