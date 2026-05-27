import useSession from "../hooks/useSession";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

const AppHomePage = () => {
  const { user } = useSession();

  const isServiceProvider = user?.role === "service_provider";
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.name}`}
        description="Your engineering marketplace dashboard"
      />

      {isServiceProvider && <ServiceProviderDashboard />}
      {isClient && <ClientDashboard />}
      {isAdmin && <AdminDashboard />}
    </div>
  );
};

function ServiceProviderDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Profile completeness"
          value="0%"
          hint="Complete your profile to attract clients"
        />
        <StatCard label="Skills" value="3" hint="You have 3 skills listed" />
        <StatCard
          label="Visibility"
          value="Available"
          hint="You're visible to clients"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Complete your profile to start receiving bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/profile">View My Profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/profile/skills">Manage Skills</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Saved providers"
          value="0"
          hint="Add providers to your list"
        />
        <StatCard
          label="Active bookings"
          value="0"
          hint="You have no active bookings"
        />
        <StatCard label="Messages" value="0" hint="No new messages" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find experts</CardTitle>
          <CardDescription>Browse and book engineering experts</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/providers">
              <Zap className="mr-2 h-4 w-4" />
              Browse providers
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Pending verifications"
          value="0"
          hint="Review provider submissions"
        />
        <StatCard
          label="Total users"
          value="0"
          hint="Accounts on the platform"
        />
        <StatCard
          label="Skill submissions"
          value="0"
          hint="Pending taxonomy updates"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin tasks</CardTitle>
          <CardDescription>Manage the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/users">Manage users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/verification">Review verification</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AppHomePage;
