"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Phone, Car, ShieldCheck } from "lucide-react";

interface Booking {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  seatsBooked: number;
  totalPrice: number;
  type: string;
  driverPhone: string;
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        router.push("/auth");
        return;
      }

      try {
        const q = query(collection(db, "bookings"), where("passengerEmail", "==", user.email));
        const querySnapshot = await getDocs(q);
        const userBookings: Booking[] = [];
        querySnapshot.forEach((docSnap) => {
          userBookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
        });
        setBookings(userBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center py-24 font-bold text-gray-500">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Booking History</h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 space-y-3">
          <p>You haven&apos;t booked any trips yet.</p>
          <button 
            onClick={() => router.push("/search")}
            className="bg-[#185FA5] text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-sm hover:bg-[#124b82] transition"
          >
            Find Rides Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="bg-blue-100 text-[#185FA5] text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                  {booking.type} Booking
                </span>
                <span className="text-sm font-black text-gray-900">
                  Rs {booking.totalPrice}
                </span>
              </div>

              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {booking.origin} <span className="text-gray-400">→</span> {booking.destination}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {booking.time}</span>
                {booking.type === "passenger" && (
                  <span className="flex items-center gap-1 font-semibold text-gray-700">💺 {booking.seatsBooked} Seats</span>
                )}
                <span className="flex items-center gap-1"><Phone size={14} /> Driver: {booking.driverPhone}</span>
              </div>

              {/* Live Tracking Button Link */}
              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => router.push(`/track/${booking.tripId}`)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-[#185FA5] font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  📍 Track Live Location
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}