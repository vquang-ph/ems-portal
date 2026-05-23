import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
