"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Clock, Users, Trash2, MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  totalSeats?: number;
  status: string;
  vehicleType?: string;
  vehicleIdentifier?: string;
  liveLat?: number;
  liveLng?: number;
}

interface Booking {
  id: string;
  tripId: string;
  passengerEmail: string;
  seatsBooked: number;
  totalPrice: number;
  type: string;
}

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookingsMap, setBookingsMap] = useState<{ [key: string]: Booking[] }>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
        fetchDriverData(user.email);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDriverData = async (email: string) => {
    try {
      // Fetch driver trips
      const tripsQuery = query(collection(db, "trips"), where("driverEmail", "==", email));
      const tripSnapshot = await getDocs(tripsQuery);
      const tripList: Trip[] = [];

      // Calculate 4 days ago threshold
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      const cutoffDate = fourDaysAgo.toISOString().split("T")[0];

      tripSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Only keep trips that are not older than 4 days
        if (data.date && data.date >= cutoffDate) {
          tripList.push({ id: docSnap.id, ...data } as Trip);
        }
      });

      setTrips(tripList);

      // Fetch bookings for these trips
      const bookingSnapshot = await getDocs(collection(db, "bookings"));
      const map: { [key: string]: Booking[] } = {};
      
      bookingSnapshot.forEach((docSnap) => {
        const bData = docSnap.data() as Booking;
        if (!map[bData.tripId]) {
          map[bData.tripId] = [];
        }
        map[bData.tripId].push({ id: docSnap.id, ...bData });
      });

      setBookingsMap(map);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, "trips", tripId));
      setTrips(trips.filter((t) => t.id !== tripId));
      alert("Trip deleted successfully.");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  const handleBroadcastLocation = (tripId: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setBroadcastingId(tripId);
    alert("Live GPS broadcasting started! Your location will update in real-time.");

    navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const tripRef = doc(db, "trips", tripId);
          await updateDoc(tripRef, {
            liveLat: lat,
            liveLng: lng,
          });
        } catch (error) {
          console.error("Error updating live location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Check GPS permissions.");
        setBroadcastingId(null);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <button 
          onClick={() => router.push("/driver/post")}
          className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
        >
          + Post New Trip
        </button>
      </div>

      <div className="space-y-6">
        {trips.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
            No active trips found within the last 4 days. Post a new route to get started!
          </div>
        ) : (
          trips.map((trip) => {
            const tripBookings = bookingsMap[trip.id] || [];
            const isBroadcasting = broadcastingId === trip.id;

            return (
              <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                      {trip.status.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-2">
                      {trip.origin} <span className="text-gray-400">→</span> {trip.destination}
                    </h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-red-500 hover:text-red-700 p-2 transition"
                    title="Delete Trip"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {trip.seatsAvailable} Seats Left</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleBroadcastLocation(trip.id)}
                    className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                      isBroadcasting 
                        ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Navigation size={16} /> {isBroadcasting ? "Broadcasting Live GPS..." : "Start Live GPS"}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-4">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                    <Users size={14} /> Booked Passengers ({tripBookings.length})
                  </h4>
                  {tripBookings.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No passengers booked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {tripBookings.map((b) => (
                        <div key={b.id} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-700">{b.passengerEmail}</span>
                          <span className="bg-blue-50 text-[#185FA5] px-2 py-0.5 rounded font-bold">
                            {b.type === "cargo" ? "Cargo" : `${b.seatsBooked} Seat(s)`} (Rs {b.totalPrice})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}