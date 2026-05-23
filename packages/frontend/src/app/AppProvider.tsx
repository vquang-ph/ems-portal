import { Provider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Provider>{children}</Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppProvider;
