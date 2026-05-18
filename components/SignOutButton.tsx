"use client";
import { signOut } from "next-auth/react";
import React from "react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`px-4 py-3 rounded-xl font-medium ${className ?? "bg-gray-700 text-white hover:bg-gray-600"}`}
    >
      Odhlásiť sa
    </button>
  );
}
