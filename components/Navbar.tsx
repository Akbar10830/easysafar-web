"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Ticket, Car, User } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // This checks who is logged in and gets their role from the database
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hide the nav completely if they are on the login page
  if (pathname === "/auth") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        
        <Link href="/" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/" ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </Link>
        
        <Link href="/search" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/search" ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
          <Search size={24} />
          <span className="text-[10px] mt-1 font-bold">Search</span>
        </Link>

        <Link href="/history" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/history" ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
          <Ticket size={24} />
          <span className="text-[10px] mt-1 font-bold">History</span>
        </Link>

        {/* SECURITY: ONLY RENDER THIS BUTTON IF THEY ARE A CAPTAIN */}
        {userRole === "captain" && (
          <Link href="/driver" className={`flex flex-col items-center p-2 transition-colors ${pathname.includes("/driver") ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
            <Car size={24} />
            <span className="text-[10px] mt-1 font-bold">Captain</span>
          </Link>
        )}

        <Link href="/profile" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/profile" ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
          <User size={24} />
          <span className="text-[10px] mt-1 font-bold">Profile</span>
        </Link>

      </div>
    </div>
  );
}