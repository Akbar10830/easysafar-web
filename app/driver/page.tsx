"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, MapPin, Calendar, Clock, Users, Trash2, PlusCircle, Navigation, RefreshCw, Eye, X, Ticket } from "lucide-react";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  type?: string;
  vehicleType?: string;
  addaName?: string;
  lat?: number;
  lng?: number;
}

interface Booking {
  id: string;
  passengerEmail: string;
  seatsBooked: number;
  totalPrice: number;
  type: string;
}

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for viewing passengers
  const [viewingTripId, setViewingTripId] = useState<string | null>(null);
  const [tripBookings, setTripBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        fetchMyTrips(user.email);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyTrips = async (email: string) => {
    try {
      const q = query(collection(db, "trips"), where("driverEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const myTrips: Trip[] = [];
      querySnapshot.forEach((docSnap) => {
        myTrips.push({ id: docSnap.id, ...docSnap.data() } as Trip);
      });
      
      myTrips.sort((a, b) => b.date.localeCompare(a.date));
      setTrips(myTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, "trips", tripId));
      setTrips(trips.filter((trip) => trip.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  const handleReuseTrip = async (trip: Trip) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):", trip.date);
    if (!newDate) return;

    const newTime = window.prompt("Enter new time (e.g., 14:30):", trip.time);
    if (!newTime) return;

    try {
      await updateDoc(doc(db, "trips", trip.id), {
        date: newDate,
        time: newTime,
        seatsAvailable: trip.totalSeats 
      });
      alert("Trip successfully updated and reactivated!");
      fetchMyTrips(auth.currentUser?.email || "");
    } catch (error) {
      console.error("Error reusing trip:", error);
      alert("Failed to update trip schedule.");
    }
  };

  const handleShareLocation = async (tripId: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const tripRef = doc(db, "trips", tripId);
          
          await updateDoc(tripRef, {
            lat: latitude,
            lng: longitude,
            locationUpdatedAt: new Date().toISOString()
          });

          alert("Live location shared successfully!");
          fetchMyTrips(auth.currentUser?.email || ""); 
        } catch (error) {
          console.error("Error sharing location:", error);
          alert("Failed to update location in database.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Please enable location permissions in your browser settings.");
      },
      { enableHighAccuracy: true }
    );
  };

  // NEW: Fetch bookings for a specific trip
  const handleViewPassengers = async (tripId: string) => {
    setViewingTripId(tripId);
    setLoadingBookings(true);
    try {
      const q = query(collection(db, "bookings"), where("tripId", "==", tripId));
      const querySnapshot = await getDocs(q);
      const bookingsList: Booking[] = [];
      querySnapshot.forEach((docSnap) => {
        bookingsList.push({ id: docSnap.id, ...docSnap.data() } as Booking);
      });
      setTripBookings(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-gray-500">Loading your posts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#185FA5] flex items-center gap-2">
          Welcome as a Driver! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Manage your posted trips and share your live location with passengers.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Car className="text-gray-800" size={24} />
          <h2 className="text-xl font-bold text-gray-900">My Posted Trips</h2>
        </div>
        <Link href="/driver/post" className="bg-[#185FA5] hover:bg-[#124b82] text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm">
          <PlusCircle size={16} /> New
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-4 shadow-sm">
          <p>You haven't posted any trips yet.</p>
          <Link href="/driver/post" className="inline-block bg-blue-50 text-[#185FA5] font-bold px-6 py-2 rounded-xl border border-blue-100 transition hover:bg-blue-100">
            Post your first trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            
            const tripDateTime = new Date(`${trip.date}T${trip.time}:00`);
            const isExpired = new Date() > tripDateTime;

            return (
              <div key={trip.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col gap-4 relative">
                
                <button onClick={() => handleDelete(trip.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-xl" title="Delete Trip">
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-2 pr-10">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    trip.type === "adda" || trip.addaName 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-blue-50 text-[#185FA5] border border-blue-200"
                  }`}>
                    <Car size={12} />
                    {trip.vehicleType || (trip.type === "adda" || trip.addaName ? "Adda Van" : "Private Car")}
                  </span>
                  
                  {isExpired && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-orange-200">
                      Completed Route
                    </span>
                  )}
                  
                  {!isExpired && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 font-medium">{trip.seatsAvailable} seats left</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-lg font-bold text-gray-900 pr-10">
                  <MapPin size={18} className="text-gray-400" />
                  {trip.origin} <span className="text-gray-400">→</span> {trip.destination}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Date & Time</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1"><Calendar size={14} className="text-[#185FA5]"/> {trip.date}</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1"><Clock size={14} className="text-[#185FA5]"/> {trip.time}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Price</span>
                    <span className="font-bold text-gray-900 text-base">Rs {trip.price}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1 col-span-2 sm:col-span-2">
                    <span className="text-gray-500 text-[10px] font-bold uppercase">Seats Available</span>
                    <div className="flex items-center gap-2">
                      <Users size={16} className={trip.seatsAvailable > 0 ? "text-green-600" : "text-red-600"} />
                      <span className={`font-bold text-base ${trip.seatsAvailable > 0 ? "text-green-600" : "text-red-600"}`}>
                        {trip.seatsAvailable} <span className="text-sm font-medium text-gray-600">/ {trip.totalSeats}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* NEW: View Passengers Button */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button 
                    onClick={() => handleViewPassengers(trip.id)} 
                    className="flex-1 bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> View Bookings
                  </button>

                  {isExpired ? (
                    <button 
                      onClick={() => handleReuseTrip(trip)} 
                      className="flex-1 bg-orange-50 text-orange-600 font-bold py-3 rounded-xl border border-orange-200 hover:bg-orange-100 transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} /> Reuse Route
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleShareLocation(trip.id)} 
                      className="flex-1 bg-blue-50 text-[#185FA5] font-bold py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} /> Share Location
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* NEW: PASSENGER LIST MODAL */}
      {viewingTripId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Ticket size={20} className="text-[#185FA5]" /> Bookings List
              </h3>
              <button onClick={() => setViewingTripId(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X size={16} />
              </button>
            </div>
            
            {loadingBookings ? (
              <div className="text-center text-gray-500 py-8 font-medium">Loading passengers...</div>
            ) : tripBookings.length === 0 ? (
              <div className="text-center text-gray-500 py-8 font-medium bg-gray-50 rounded-2xl border border-gray-100">
                No bookings yet for this trip.
              </div>
            ) : (
              <div className="space-y-3">
                {tripBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 text-sm break-all">
                        {booking.passengerEmail}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${booking.type === 'cargo' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {booking.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-200 pt-2">
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Users size={14} /> {booking.seatsBooked} {booking.type === 'cargo' ? 'Space' : 'Seats'}
                      </span>
                      <span className="text-sm font-black text-green-600">
                        Rs {booking.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}