import type { ProviderProfile } from "@ems-portal/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVIDER_PROFILE_TEST_IDS } from "../test/testIds";
import formatRate from "../utils/formatRate";

interface ProfileCardProps {
  profile: ProviderProfile;
  name?: string;
}

const ProfileCard = ({ profile, name }: ProfileCardProps) => {
  const initials = (name ?? "P").slice(0, 2).toUpperCase();
  return (
    <Card data-testid={PROVIDER_PROFILE_TEST_IDS.profileCard}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>{name ?? "Provider"}</CardTitle>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              ★ {profile.ratingAverage.toFixed(1)} ({profile.ratingCount})
            </span>
            <Badge variant={profile.isAvailable ? "default" : "secondary"}>
              {profile.isAvailable ? "Available" : "Unavailable"}
            </Badge>
            <Badge variant="outline">{profile.verificationStatus}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="whitespace-pre-line text-sm">{profile.bio}</p>
        )}

        <div className="text-sm">
          <span className="font-medium">Rate: </span>
          {formatRate(profile.hourlyRateMin, profile.hourlyRateMax)}
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-medium">Skills</div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s.skillId} variant="secondary">
                  #{s.skillId} · {s.level}
                  {s.yearsOfExperience > 0 && ` · ${s.yearsOfExperience}y`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
