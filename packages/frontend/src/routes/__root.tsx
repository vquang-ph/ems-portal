import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import App from "../app/App";
import RootLayout from "@/layouts/RootLayout";

const RootComponent = () => (
  <App>
    <RootLayout />
    <TanStackRouterDevtools />
  </App>
);

export const Route = createRootRoute({ component: RootComponent });
