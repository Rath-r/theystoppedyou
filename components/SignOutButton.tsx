"use client";
import { signOut } from "next-auth/react";
import React from "react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
    >
      Odhlásiť sa
    </button>
  );
}
