import { AuthLayout } from "@/layouts/AuthLayout";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterForm from "../components/RegisterForm";
import { Link } from "@tanstack/react-router";

const RegisterPage = () => {
  return (
    <AuthLayout
      footerLink={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription className="text-base">
          Join EMS Portal as a Client or Service Provider.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <RegisterForm />
      </CardContent>
    </AuthLayout>
  );
};

export default RegisterPage;
