"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Clock, MapPin, Bus, Car } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet map to avoid SSR window errors
const MapWithNoSSR = dynamic(() => import("@/components/LiveMap"), { 
  ssr: false,
  loading: () => <p className="p-4 text-gray-500">Loading interactive map...</p>
});

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
  const [activeTrackingTrip, setActiveTrackingTrip] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        try {
          const q = query(collection(db, "bookings"), where("passengerEmail", "==", user.email));
          const querySnapshot = await getDocs(q);
          const list: Booking[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Booking);
          });
          setBookings(list);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Bookings & Tracking</h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
          You have no active bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-[#185FA5] text-xs px-2.5 py-1 rounded-full font-bold">
                      {booking.type === "cargo" ? "Cargo Transport" : `${booking.seatsBooked} Seat(s)`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {booking.origin} <span className="text-gray-400">→</span> {booking.destination}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-gray-900">Rs {booking.totalPrice}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {booking.time}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> Driver: {booking.driverPhone}</span>
              </div>

              <button
                onClick={() => setActiveTrackingTrip(activeTrackingTrip === booking.tripId ? null : booking.tripId)}
                className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-2.5 rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> {activeTrackingTrip === booking.tripId ? "Close Map" : "Track Live Location"}
              </button>

              {activeTrackingTrip === booking.tripId && (
                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-2">
                  <MapWithNoSSR />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}