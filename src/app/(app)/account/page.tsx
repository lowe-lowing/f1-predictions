import SignOutBtn from "@/components/auth/SignOutBtn";
import { getUserAuth } from "@/lib/auth/utils";
import UserSettings from "./UserSettings";

export default async function Account() {
  const { session } = await getUserAuth();

  return (
    <main>
      <h1 className="text-2xl font-semibold my-4">Account</h1>
      <div className="space-y-4">
        <UserSettings session={session} />
        <SignOutBtn />
      </div>
    </main>
  );
}
