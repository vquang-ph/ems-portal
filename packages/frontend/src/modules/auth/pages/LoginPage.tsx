import { AuthLayout } from "@/layouts/AuthLayout";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "../components/LoginForm";
import { Link } from "@tanstack/react-router";

const LoginPage = () => {
  return (
    <AuthLayout
      footerLink={
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-foreground hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in to access your EMS Portal account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </AuthLayout>
  );
};

export default LoginPage;
