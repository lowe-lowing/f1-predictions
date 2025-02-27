import ViewRanks from "@/app/(app)/dashboard/ViewRanks";
import ViewTop5 from "./ViewTop5";

// TODO: Prio 1 Fix backend
// TODO: Fix Home page score display
// TODO: Move ViewTop5 to its own page
// TODO: Fix drivers page

export default async function Home() {
  return (
    <main className="space-y-4">
      <ViewRanks />
      <ViewTop5 />
    </main>
  );
}
