import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import {
  PUBLIC_USER_ROLE_VALUES,
  RegisterSchema,
  UserRole,
  type Register,
} from "@ems-portal/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useRegisterMutation from "../hooks/mutations/useRegisterMutation";
import { AUTH_TEST_IDS } from "../test/testIds";

const ROLE_LABEL: Record<(typeof PUBLIC_USER_ROLE_VALUES)[number], string> = {
  [UserRole.Client]: "Client",
  [UserRole.ServiceProvider]: "Service Provider",
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useRegisterMutation();

  const form = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: UserRole.Client,
    },
  });

  const onSubmit = (data: Register) => {
    mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/" });
      },
    });
  };

  const submitError = (() => {
    if (!error) return null;
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 409) return "That email is already registered.";
    }
    return "Something went wrong. Please try again.";
  })();

  return (
    <form
      data-testid={AUTH_TEST_IDS.registerForm}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit(onSubmit)();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-name">Full name</FieldLabel>
              <Input
                {...field}
                id="register-name"
                placeholder="Your Full Name"
                data-testid={AUTH_TEST_IDS.registerName}
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                {...field}
                id="register-email"
                placeholder="you@example.com"
                data-testid={AUTH_TEST_IDS.registerEmail}
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                {...field}
                id="register-password"
                placeholder="Create a password"
                data-testid={AUTH_TEST_IDS.registerPassword}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-role">I am a...</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="register-role"
                  data-testid={AUTH_TEST_IDS.registerRole}
                >
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  {PUBLIC_USER_ROLE_VALUES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABEL[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {submitError && (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        data-testid={AUTH_TEST_IDS.registerSubmit}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
