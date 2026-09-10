"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, History, User, PlusCircle, Building2, Car } from "lucide-react";

export default function BottomNav() {
  const [role, setRole] = useState<string | null>("passenger"); // Default to passenger so icons render smoothly
  const pathname = usePathname();

  useEffect(() => {
    // Listen for login state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch the user's role from the database
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole("passenger"); // Fallback
        }
      } else {
        setRole("passenger"); // Fallback for guest users so they still see Home and Search
      }
    });
    return () => unsubscribe();
  }, []);

  // Don't show the navbar on the Auth page
  if (pathname === "/auth") return null;

  // Helper to style active links
  const isActive = (path: string) => pathname === path ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600";

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center pb-4 pt-2 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* ---------------- COMMON LINKS (EVERYONE SEES THESE) ---------------- */}
      <Link href="/" className={`flex flex-col items-center gap-1 ${isActive("/")}`}>
        <Home size={24} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      
      <Link href="/search" className={`flex flex-col items-center gap-1 ${isActive("/search")}`}>
        <Search size={24} />
        <span className="text-[10px] font-bold">Search</span>
      </Link>

      {/* ---------------- PASSENGER ONLY ---------------- */}
      {role === "passenger" && (
        <Link href="/history" className={`flex flex-col items-center gap-1 ${isActive("/history")}`}>
          <History size={24} />
          <span className="text-[10px] font-bold">History</span>
        </Link>
      )}

      {/* ---------------- DRIVER ONLY ---------------- */}
      {role === "driver" && (
        <>
          <Link href="/driver" className={`flex flex-col items-center gap-1 ${isActive("/driver")}`}>
            <Car size={24} />
            <span className="text-[10px] font-bold">Dashboard</span>
          </Link>
          <Link href="/driver/post" className={`flex flex-col items-center gap-1 ${isActive("/driver/post")}`}>
            <PlusCircle size={24} />
            <span className="text-[10px] font-bold">Post</span>
          </Link>
        </>
      )}

      {/* ---------------- ADDA OWNER ONLY ---------------- */}
      {role === "adda_owner" && (
        <>
          <Link href="/adda" className={`flex flex-col items-center gap-1 ${isActive("/adda")}`}>
            <Building2 size={24} />
            <span className="text-[10px] font-bold">Adda</span>
          </Link>
          <Link href="/adda/post" className={`flex flex-col items-center gap-1 ${isActive("/adda/post")}`}>
            <PlusCircle size={24} />
            <span className="text-[10px] font-bold">Post</span>
          </Link>
        </>
      )}

      {/* ---------------- COMMON PROFILE LINK (EVERYONE SEES THIS) ---------------- */}
      <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile")}`}>
        <User size={24} />
        <span className="text-[10px] font-bold">Profile</span>
      </Link>

    </nav>
  );
}