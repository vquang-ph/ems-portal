import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import App from "../app/App";

const RootComponent = () => (
  <App>
    <Outlet />
    <TanStackRouterDevtools />
  </App>
);

export const Route = createRootRoute({ component: RootComponent });
