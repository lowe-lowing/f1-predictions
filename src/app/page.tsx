import Link from "next/link";
import Image from "next/image";
import SignInLinkButton from "@/components/auth/SignInLinkButton";
import { redirectIfSignedIn } from "@/lib/auth/utils";

export default async function LandingPage() {
  await redirectIfSignedIn();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <p>CoolClub F1 Predictions</p>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <SignInLinkButton />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-6 sm:pt-12 md:pt-20 lg:pt-24">
          <div className="container px-4 md:px-6 flex flex-col items-center gap-6 text-center">
            <Image src="/CoolClubF1Logo.svg" alt="CoolClub F1 logo" width={500} height={500} priority />
            <p className="text-5xl">Welcome to CoolClub F1 Predictions!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
