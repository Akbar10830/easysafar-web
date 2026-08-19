"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  // Listen to Firebase to see if someone is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // We don't need a top nav on the auth screen itself!
  if (pathname === "/auth") return null;

  return (
    <nav className="bg-[#185FA5] text-white py-4 px-4 sm:px-6 shadow-md flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <div className="bg-white text-[#185FA5] w-8 h-8 flex items-center justify-center rounded font-bold">E</div>
        <span className="hidden sm:inline">EasySafar</span>
      </Link>
      
      {/* Dynamic Button based on Login Status */}
      <div>
        {user ? (
          <Link href="/profile" className="bg-white text-[#185FA5] px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm text-sm">
            My Profile
          </Link>
        ) : (
          <Link href="/auth" className="bg-white text-[#185FA5] px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm text-sm">
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}