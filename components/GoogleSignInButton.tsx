"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold shadow hover:brightness-95"
    >
      <span className="w-5 h-5 inline-block">
        <svg
          viewBox="0 0 48 48"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M44.5 20H24v8.5h11.9C34.2 33 30 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.2 8.6 3.2l6-6C33 3.8 28.8 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21 21-9.3 21-21c0-1.4-.1-2.7-.5-4z"
            fill="#EA4335"
          />
        </svg>
      </span>
      Prihlásiť sa cez Google
    </button>
  );
}
