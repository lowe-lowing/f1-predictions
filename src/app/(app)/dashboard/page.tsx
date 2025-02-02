import ViewTop5 from "./ViewTop5";

export default async function Home() {
  // TODO: show everyones rank by getting their current points
  return (
    <main className="space-y-4">
      <ViewTop5 />
    </main>
  );
}
