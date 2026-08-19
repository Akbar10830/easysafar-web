"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Ticket, Car, User, Bus, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
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

        {/* DYNAMIC TAB: HISTORY FOR PASSENGERS, MY POSTS FOR ADDA OWNERS */}
        {userRole === "adda_owner" ? (
          <Link href="/adda/posts" className={`flex flex-col items-center p-2 transition-colors ${pathname.includes("/adda/posts") ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}>
            <ClipboardList size={24} />
            <span className="text-[10px] mt-1 font-bold">My Posts</span>
          </Link>
        ) : (
          <Link href="/history" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/history" ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
            <Ticket size={24} />
            <span className="text-[10px] mt-1 font-bold">History</span>
          </Link>
        )}

        {/* DRIVER BUTTON */}
        {userRole === "captain" && (
          <Link href="/driver" className={`flex flex-col items-center p-2 transition-colors ${pathname.includes("/driver") ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}>
            <Car size={24} />
            <span className="text-[10px] mt-1 font-bold">Driver</span>
          </Link>
        )}

        {/* RENAMED TO "ADDA" FOR ADDA OWNERS */}
        {userRole === "adda_owner" && (
          <Link href="/adda" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/adda" || pathname === "/adda/post" ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}>
            <Bus size={24} />
            <span className="text-[10px] mt-1 font-bold">Adda</span>
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