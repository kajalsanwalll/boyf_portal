"use client";

import { useClerk } from "@clerk/nextjs";

export default function LogoutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="rounded-full border border-[#2a1626]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#2a1626] transition hover:border-[#d9364f] hover:bg-[#fff1f3] hover:text-[#d9364f]"
    >
      Log out
    </button>
  );
}