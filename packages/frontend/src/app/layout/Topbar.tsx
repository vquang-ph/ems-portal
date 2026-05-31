import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  return (
    <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="h-6" orientation="vertical" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" disabled>
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <UserMenu />
      </div>
    </header>
  );
}
