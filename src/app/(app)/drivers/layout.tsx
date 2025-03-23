"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

const seasons = [2025, 2024];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  return (
    <main>
      <div className="relative space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-2xl my-2">Drivers</h1>
            <Tabs defaultValue={"2025"} className="w-[400px]">
              <TabsList>
                {seasons.map((season) => (
                  <TabsTrigger key={season} value={season.toString()} onClick={() => router.push(`/drivers/${season}`)}>
                    {season}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
