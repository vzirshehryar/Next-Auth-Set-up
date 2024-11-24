"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  console.log("session", session);
  return (
    <>
      <h1>Welcome {session?.user?.name}</h1>
      <Button
        onClick={async () => {
          await signOut({ redirect: false });
          router.push("/auth/login");
        }}
      >
        Logout
      </Button>
    </>
  );
}
