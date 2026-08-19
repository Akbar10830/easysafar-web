"use client";
import Link from "next/link";
import { Car, Package, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Extract a name from the email (e.g., ali@test.com becomes "Ali")
  const displayName = userEmail ? userEmail.split("@")[0] : "Guest";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">Hello, {displayName} 👋</h1>
          <p className="text-gray-500">Where are we going today?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Book a Ride */}
        <Link href="/search" className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition group">
          <div className="w-12 h-12 bg-orange-50 text-[#D35400] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Car size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Book a Ride</h2>
          <p className="text-gray-500 text-sm">Find a seat in a car or book a full vehicle for yourself and your family.</p>
        </Link>

        {/* Send Cargo - Fixed Link! */}
        <Link href="/search" className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Send Cargo</h2>
          <p className="text-gray-500 text-sm">Hire space for your goods, furniture, or luggage on a shared trip.</p>
        </Link>
      </div>
      
      {/* Quick link to history */}
      <div className="bg-[#185FA5] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Ticket size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1">View Your Tickets</h2>
            <p className="text-blue-100 text-sm">Check your upcoming trips and bookings</p>
          </div>
        </div>
        <Link href="/history" className="bg-white text-[#185FA5] px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-gray-100 transition w-full sm:w-auto text-center">
          View History
        </Link>
      </div>
    </div>
  );
}