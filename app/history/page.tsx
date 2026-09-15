"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Ticket, MapPin, Calendar, Clock, Users, Banknote, Phone, Package, Trash2 } from "lucide-react";
import Link from "next/link";

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
  contact: string;
  bookedAt?: any;
}

export default function PassengerHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        fetchMyBookings(user.email);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMyBookings = async (email: string) => {
    try {
      const q = query(
        collection(db, "bookings"), 
        where("passengerEmail", "==", email)
      );
      const querySnapshot = await getDocs(q);
      const myBookings: Booking[] = [];
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const cutoffDate = threeDaysAgo.toISOString().split("T")[0];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.date < cutoffDate) {
          deleteDoc(doc(db, "bookings", docSnap.id)).catch((err) => console.error("Error auto-deleting old booking:", err));
        } else {
          myBookings.push({ id: docSnap.id, ...data } as Booking);
        }
      });
      
      myBookings.sort((a, b) => {
        const timeA = a.bookedAt?.seconds || 0;
        const timeB = b.bookedAt?.seconds || 0;
        return timeB - timeA; 
      });

      setBookings(myBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Delete individual booked trip handler
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booked trip from your history?")) return;
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-gray-500">Loading your booked tickets...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#185FA5] flex items-center gap-2">
          <Ticket size={32} /> My Booked Trips
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          View all the rides you have booked as a passenger.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-4 shadow-sm">
          <p>You haven't booked any recent trips.</p>
          <Link href="/search" className="inline-block bg-blue-50 text-[#185FA5] font-bold px-6 py-2 rounded-xl border border-blue-100 transition hover:bg-blue-100">
            Find a Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col gap-4 relative">
              
              {/* DELETE BUTTON */}
              <button 
                onClick={() => handleDeleteBooking(booking.id)} 
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-xl" 
                title="Delete Booking"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-2 pr-10 mb-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                  booking.type === "cargo" ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-blue-50 text-[#185FA5] border border-blue-200"
                }`}>
                  {booking.type === "cargo" ? <Package size={12} /> : <Users size={12} />}
                  {booking.type === "cargo" ? "Cargo Booking" : "Passenger Seat"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xl font-bold text-gray-900 pr-10">
                <MapPin size={20} className="text-gray-400" />
                {booking.origin} <span className="text-gray-400">→</span> {booking.destination}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Departure</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Calendar size={14} className="text-[#185FA5]"/> {booking.date}</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Clock size={14} className="text-[#185FA5]"/> {booking.time}</span>
                </div>
                {booking.type === "passenger" && (
                  <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Seats</span>
                    <span className="font-bold text-gray-900 text-lg flex items-center gap-1">{booking.seatsBooked}</span>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Total Paid</span>
                  <span className="font-bold text-green-600 text-lg flex items-center gap-1"><Banknote size={16} /> Rs {booking.totalPrice}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1 md:col-span-1 col-span-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Driver Contact</span>
                  <span className="font-bold text-gray-800 text-base flex items-center gap-1"><Phone size={14} className="text-gray-500" /> {booking.contact !== "N/A" ? booking.contact : "Number Hidden"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}