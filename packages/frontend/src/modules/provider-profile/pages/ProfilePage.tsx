import { Link, useSearch } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useAtomValue } from "jotai";
import { UserRole } from "@ems-portal/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUserAtom } from "@/modules/auth";
import ProfileCard from "../components/ProfileCard";
import useMyProfileQuery from "../hooks/queries/useMyProfileQuery";
import useProviderProfileQuery from "../hooks/queries/useProviderProfileQuery";

const ProfilePage = () => {
  const currentUser = useAtomValue(currentUserAtom);
  const search = useSearch({ strict: false });
  const requestedUserId = search.userId;

  const isViewingOther =
    !!requestedUserId && requestedUserId !== currentUser?.id;

  const myProfileQuery = useMyProfileQuery();
  const otherProfileQuery = useProviderProfileQuery(
    isViewingOther ? requestedUserId : undefined,
  );

  const activeQuery = isViewingOther ? otherProfileQuery : myProfileQuery;
  const { data: profile, isLoading, error } = activeQuery;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  if (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      return (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view this profile.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    if (
      isViewingOther &&
      isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Profile not found</CardTitle>
            <CardDescription>
              This provider does not exist or has not published a profile.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load profile.
      </p>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile =
    !isViewingOther && currentUser?.role === UserRole.ServiceProvider;

  if (isOwnProfile && profile.profileStatus === "draft") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Your profile is in draft</CardTitle>
          <CardDescription>
            Finish filling it in and publish to start getting matched with
            clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild>
            <Link to="/profile/setup">Continue setup</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile/skills">Manage skills</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <ProfileCard profile={profile} name={currentUser?.name} />
      {isOwnProfile && (
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/profile/setup">Edit profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile/skills">Manage skills</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
