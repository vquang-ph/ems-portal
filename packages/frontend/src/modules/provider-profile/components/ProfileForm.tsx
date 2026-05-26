import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  UpdateProviderProfileSchema,
  type UpdateProviderProfile,
} from "@ems-portal/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PROVIDER_PROFILE_TEST_IDS } from "../test/testIds";
import numberOrNull from "../utils/numberOrNull";

interface ProfileFormProps {
  defaultValues?: UpdateProviderProfile;
  onSubmit: (data: UpdateProviderProfile) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const ProfileForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save profile",
}: ProfileFormProps) => {
  const form = useForm<UpdateProviderProfile>({
    resolver: zodResolver(UpdateProviderProfileSchema),
    defaultValues: {
      bio: defaultValues?.bio ?? "",
      hourlyRateMin: defaultValues?.hourlyRateMin ?? null,
      hourlyRateMax: defaultValues?.hourlyRateMax ?? null,
      isAvailable: defaultValues?.isAvailable ?? true,
      latitude: defaultValues?.latitude ?? null,
      longitude: defaultValues?.longitude ?? null,
    },
  });

  return (
    <form
      data-testid={PROVIDER_PROFILE_TEST_IDS.profileForm}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit(onSubmit)();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
              <Textarea
                id="profile-bio"
                data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormBio}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Tell clients about your experience..."
                rows={5}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="hourlyRateMin"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-rate-min">
                  Hourly rate (min)
                </FieldLabel>
                <Input
                  id="profile-rate-min"
                  data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormRateMin}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="hourlyRateMax"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-rate-max">
                  Hourly rate (max)
                </FieldLabel>
                <Input
                  id="profile-rate-max"
                  data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormRateMax}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="latitude"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-latitude">Latitude</FieldLabel>
                <Input
                  id="profile-latitude"
                  data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormLatitude}
                  type="number"
                  step="0.000001"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="longitude"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-longitude">Longitude</FieldLabel>
                <Input
                  id="profile-longitude"
                  data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormLongitude}
                  type="number"
                  step="0.000001"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(numberOrNull(e.target.value))}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="isAvailable"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-row items-center justify-between"
            >
              <FieldLabel htmlFor="profile-available">
                Available for new engagements
              </FieldLabel>
              <Switch
                id="profile-available"
                data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormAvailable}
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        data-testid={PROVIDER_PROFILE_TEST_IDS.profileFormSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default ProfileForm;
