"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkCredentials, startSession } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError("");

    // tiny delay so the button feels like it responded, not instant/robotic
    setTimeout(() => {
      if (checkCredentials(username, password)) {
        startSession();
        router.push("/dashboard");
      } else {
        setError("That username or password doesn't match. Please try again.");
        setChecking(false);
      }
    }, 250);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        {/* Ledger tab */}
        <div className="ml-6 inline-flex items-center gap-2 bg-brass text-paper text-sm font-semibold tracking-wide px-4 py-1.5 rounded-t-md">
          <CoinIcon className="w-4 h-4" />
          Family Ledger
        </div>

        <div className="bg-white/70 backdrop-blur-[2px] border border-paper-line rounded-card rounded-tl-none shadow-card px-7 pt-8 pb-7 sm:px-9 sm:pt-9 sm:pb-8">
          <h1 className="font-display italic text-[1.9rem] leading-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-ink-soft text-[15px] leading-relaxed">
            Sign in to see what&apos;s left to spend.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-ink">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-[10px] border-2 border-paper-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-ink-soft/50 focus:border-brass focus:outline-none transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[10px] border-2 border-paper-line bg-white px-4 py-3 pr-12 text-[16px] text-ink placeholder:text-ink-soft/50 focus:border-brass focus:outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="min-h-[1.5rem]">
              {error && (
                <p className="text-brick-deep text-sm font-medium flex items-start gap-1.5">
                  <span aria-hidden="true">&#9888;</span>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={checking}
              className="mt-1 rounded-[10px] bg-sage-deep text-paper font-semibold text-[16px] py-3.5 hover:bg-[#324a33] active:scale-[0.99] transition-all disabled:opacity-70"
            >
              {checking ? "Checking\u2026" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-soft/70 text-xs mt-5">
          Kept in the family &mdash; your entries stay on this device.
        </p>
      </div>
    </main>
  );
}

function CoinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M9.5 10c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 1.4-2.5 1.9-2.5.8-2.5 2 1.1 2.1 2.5 2.1 2.5-.9 2.5-2"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.5 6.9C4 8.4 2 12 2 12s3.6 7 10 7c1.8 0 3.4-.5 4.7-1.2M9.9 5.2C10.6 5.1 11.3 5 12 5c6.4 0 10 7 10 7-.6 1.1-1.5 2.4-2.7 3.6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
