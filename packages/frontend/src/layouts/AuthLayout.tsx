import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export interface AuthLayoutProps {
  children: ReactNode;
  footerLink?: ReactNode;
}

export function AuthLayout({ children, footerLink }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">EMS Portal</h1>
          <p className="mt-2 text-lg text-slate-300">
            Connect with engineering experts
          </p>
        </div>
        <p className="text-sm text-slate-400">
          © 2026 EMS Portal. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <div className="p-6">
            {children}
            {footerLink && (
              <div className="mt-6 border-t pt-6 text-center text-sm">
                {footerLink}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
