"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInLinkButton() {
  return (
    <Button variant={"link"} onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>
      Sign In
    </Button>
  );
}
