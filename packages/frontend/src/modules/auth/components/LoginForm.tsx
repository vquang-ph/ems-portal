import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { LoginSchema, type Login } from "@ems-portal/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import useLoginMutation from "../hooks/mutations/useLoginMutation";
import { AUTH_TEST_IDS } from "../test/testIds";

const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLoginMutation();

  const form = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: Login) => {
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
      if (status === 401) return "Invalid email or password.";
    }
    return "Something went wrong. Please try again.";
  })();

  return (
    <form
      data-testid={AUTH_TEST_IDS.loginForm}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit(onSubmit)();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                {...field}
                id="login-email"
                data-testid={AUTH_TEST_IDS.loginEmail}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
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
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                {...field}
                id="login-password"
                placeholder="Your password"
                data-testid={AUTH_TEST_IDS.loginPassword}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
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
        data-testid={AUTH_TEST_IDS.loginSubmit}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        New here?{" "}
        <Link to="/register" className="underline">
          Create an account
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
