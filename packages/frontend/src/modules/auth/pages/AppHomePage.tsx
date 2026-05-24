import useSession from "../hooks/useSession";

const AppHomePage = () => {
  const { user } = useSession();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">
        Welcome{user ? `, ${user.name}` : ""}
      </h1>
      <p className="text-muted-foreground">
        You're signed in to EMS Portal. Real role-specific dashboards will live
        here once we wire them up.
      </p>
    </div>
  );
};

export default AppHomePage;
