import { useNavigate } from "@tanstack/react-router";
import type { UpdateProviderProfile } from "@ems-portal/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileForm from "../components/ProfileForm";
import usePublishProfileMutation from "../hooks/mutations/usePublishProfileMutation";
import useUpdateProfileMutation from "../hooks/mutations/useUpdateProfileMutation";
import useMyProfileQuery from "../hooks/queries/useMyProfileQuery";

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfileQuery();

  const updateMutation = useUpdateProfileMutation();
  const publishMutation = usePublishProfileMutation();

  const handleSubmit = (data: UpdateProviderProfile) => {
    updateMutation.mutate(data, {
      onSuccess: () => void navigate({ to: "/profile" }),
    });
  };

  const handlePublish = () => {
    publishMutation.mutate(undefined, {
      onSuccess: () => void navigate({ to: "/profile" }),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  if (!profile) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load profile.
      </p>
    );
  }

  const isDraft = profile.profileStatus === "draft";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isDraft ? "Set up your profile" : "Edit your profile"}
          </CardTitle>
          <CardDescription>
            {isDraft
              ? "Tell clients about your experience, then publish to start getting matched."
              : "Update your bio, rates, and availability."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              bio: profile.bio,
              hourlyRateMin: profile.hourlyRateMin,
              hourlyRateMax: profile.hourlyRateMax,
              isAvailable: profile.isAvailable,
              latitude: profile.latitude,
              longitude: profile.longitude,
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            submitLabel="Save changes"
          />
          {updateMutation.error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              Could not save profile. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      {isDraft && (
        <Card>
          <CardHeader>
            <CardTitle>Publish your profile</CardTitle>
            <CardDescription>
              Once published, your profile becomes visible to matching. You need
              a bio, location, hourly rate range, and at least one skill.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Publishing…" : "Publish profile"}
            </Button>
            {publishMutation.error && (
              <p className="mt-4 text-sm text-destructive" role="alert">
                Could not publish. Make sure required fields and at least one
                skill are filled in.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSetupPage;
