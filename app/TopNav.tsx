"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Bus, User, LogIn } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (pathname === "/auth") return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#185FA5] text-white p-2 rounded-xl">
            <Bus size={20} />
          </div>
          <span className="font-black text-xl text-[#185FA5] tracking-tight">EasySafar</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/profile" className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition border border-gray-200">
              <div className="w-7 h-7 bg-blue-100 text-[#185FA5] rounded-full flex items-center justify-center font-bold text-xs">
                {user.email ? user.email[0].toUpperCase() : "U"}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">{user.email}</span>
            </Link>
          ) : (
            <Link href="/auth" className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#124b82] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}