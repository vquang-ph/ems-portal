import { isAxiosError } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SkillsManager from "../components/SkillsManager";
import useMyProfileQuery from "../hooks/queries/useMyProfileQuery";

const ProfileSkillsPage = () => {
  const { data: profile, isLoading, error } = useMyProfileQuery();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const missingProfile = isAxiosError(error) && error.response?.status === 404;

  if (missingProfile || !profile) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Set up your profile first</CardTitle>
          <CardDescription>
            You need to create a provider profile before adding skills.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Manage your skills</CardTitle>
          <CardDescription>
            Add the engineering skills you offer and your proficiency level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsManager currentSkills={profile.skills ?? []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSkillsPage;
