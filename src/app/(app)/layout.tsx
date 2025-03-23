import { checkAuth } from "@/lib/auth/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NextAuthProvider from "@/lib/auth/Provider";
import { RouteHistoryProvider } from "@/lib/context/RouteHistoryContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await checkAuth();

  return (
    <main>
      <NextAuthProvider>
        <RouteHistoryProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 md:p-8 pt-2 p-8 overflow-y-auto">
              <Navbar />
              {children}
            </main>
          </div>
        </RouteHistoryProvider>
      </NextAuthProvider>

      <Toaster richColors />
    </main>
  );
}
