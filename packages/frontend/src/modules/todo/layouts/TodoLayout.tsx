import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

const TodoLayout = () => {
  const location = useLocation();

  // If we are on the homepage (root) we hide back button
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-800">
              Boilerplate Typescript
            </span>
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="h-10 mb-6 flex items-center">
          {!isHomePage ? (
            <Link to="/">
              <Button
                variant="ghost"
                className="pl-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Tasks
              </Button>
            </Link>
          ) : (
            <span className="text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TodoLayout;
