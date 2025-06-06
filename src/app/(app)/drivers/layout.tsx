import SeasonPicker from "@/components/shared/SeasonPicker";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <div className="relative space-y-4">
        <SeasonPicker title="Drivers" path="drivers" />
        {children}
      </div>
    </main>
  );
}
