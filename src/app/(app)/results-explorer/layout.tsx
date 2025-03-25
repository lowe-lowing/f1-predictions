import SeasonPicker from "@/components/shared/SeasonPicker";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <div className="relative">
        <SeasonPicker title="Results" path="results-explorer" />
        {children}
      </div>
    </main>
  );
}
