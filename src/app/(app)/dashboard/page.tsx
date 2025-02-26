import ViewRanks from "@/app/(app)/dashboard/ViewRanks";
import ViewTop5 from "./ViewTop5";

export default async function Home() {
  return (
    <main className="space-y-4">
      <ViewRanks />
      <ViewTop5 />
    </main>
  );
}
