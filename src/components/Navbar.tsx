"use client";

import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session, status } = useSession();

  const user: User = session?.user as User;

  const router = useRouter();

  return (
    <nav className="bg-slate-200 p-5">
      {status === "authenticated" ? (
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            Welcome, {session.user.username || session.user.email}
          </span>
          <Button
            onClick={() => {
              signOut({ redirect: false });
              router.replace("/");
            }}
          >
            Signout
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">CodexFeedback</span>
          <Button onClick={() => router.push("/signin")}>Login</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
