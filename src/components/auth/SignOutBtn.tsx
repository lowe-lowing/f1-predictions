"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export default function SignOutBtn() {
  return (
    <Button variant={"destructive"} onClick={() => signOut({ callbackUrl: "/", redirect: true })}>
      Sign out
    </Button>
  );
}
