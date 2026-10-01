import { checkAuth } from "@/lib/auth/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NextAuthProvider from "@/lib/auth/Provider";
import { RouteHistoryProvider } from "@/lib/context/RouteHistoryContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();

  return (
    <main>
      <NextAuthProvider>
        <RouteHistoryProvider>
          <TooltipProvider>
            <div className="flex h-dvh">
              <Sidebar />
              <main className="flex-1 md:p-8 pt-0 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] overflow-y-auto">
                <Navbar />
                {children}
              </main>
            </div>
          </TooltipProvider>
        </RouteHistoryProvider>
      </NextAuthProvider>

      <Toaster richColors />
    </main>
  );
}
