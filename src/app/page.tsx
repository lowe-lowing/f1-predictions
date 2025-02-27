import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <p>CoolClub F1 Predictions</p>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/sign-in">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-6 sm:py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 flex flex-col items-center gap-6">
            <Image src="/CoolClubF1Logo.svg" alt="CoolClub F1 logo" width={500} height={500} priority />
            <p className="text-5xl">Welcome to CoolClub F1 Predictions!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
