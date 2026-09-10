"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Calendar, Clock, Users, Trash2, PlusCircle, Navigation } from "lucide-react";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  lat?: number;
  lng?: number;
}

export default function AddaDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-gray-500">Loading your Adda posts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="text-green-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Adda Owner Dashboard</h1>
        </div>
        <Link href="/adda/post" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm">
          <PlusCircle size={16} /> New Van
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-4 shadow-sm">
          <p>No active van routes found for your Adda.</p>
          <Link href="/adda/post" className="inline-block bg-green-50 text-green-700 font-bold px-6 py-2 rounded-xl border border-green-100 transition hover:bg-green-100">
            Post a new route
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col gap-4 relative">
              
              <button onClick={() => handleDelete(trip.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-xl" title="Delete Trip">
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 pr-10">
                <MapPin size={18} className="text-gray-400" />
                {trip.origin} <span className="text-gray-400">→</span> {trip.destination}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Date & Time</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Calendar size={14} className="text-green-600"/> {trip.date}</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Clock size={14} className="text-green-600"/> {trip.time}</span>
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

              <button 
                onClick={() => handleShareLocation(trip.id)} 
                className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl border border-green-200 hover:bg-green-100 transition flex items-center justify-center gap-2 mt-2"
              >
                <Navigation size={18} /> Update Live Location
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}