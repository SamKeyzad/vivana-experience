"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-black bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wide text-amber-800">
          VIVANA
        </Link>
      </div>
    </nav>
  );
}
