"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Navigation, StopCircle, MapPin, Calendar, Clock, Users, PlusCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function DriverDashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchDashboardData(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (email: string) => {
    try {
      // Fetch Trips posted by this driver
      const tripsRef = collection(db, "trips");
      const qTrips = query(tripsRef, where("driverEmail", "==", email));
      const tripsSnap = await getDocs(qTrips);
      const fetchedTrips = tripsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTrips(fetchedTrips);

      // Fetch Bookings for this driver's trips
      const bookingsRef = collection(db, "bookings");
      const qBookings = query(bookingsRef, where("driverEmail", "==", email));
      const bookingsSnap = await getDocs(qBookings);
      const fetchedBookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(fetchedBookings);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LIVE GPS BROADCASTING ---
  const startTracking = async () => {
    if (!userEmail) return;
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Update the GPS coordinates in Firebase for all active trips
          const activeTrips = trips.filter(t => t.status === "active");
          activeTrips.forEach(async (trip) => {
            await updateDoc(doc(db, "trips", trip.id), {
              liveLat: latitude,
              liveLng: longitude,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Make sure location permissions are enabled!");
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setIsTracking(false);
  };

  if (loading) return <div className="text-center py-16">Loading Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Captain Dashboard</h1>
        <Link href="/driver/post" className="bg-[#185FA5] hover:bg-[#124b82] text-white px-6 py-3 rounded-lg font-bold shadow-sm transition flex items-center gap-2">
          <PlusCircle size={20} /> Post New Trip
        </Link>
      </div>

      {/* NEW: LIVE TRACKING CONTROLS */}
      <div className={`p-6 rounded-2xl shadow-sm border mb-8 transition-colors ${isTracking ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Navigation className={isTracking ? "text-green-600 animate-pulse" : "text-[#185FA5]"} size={28} />
          <h2 className="text-xl font-bold text-gray-900">Live Location Broadcast</h2>
        </div>
        <p className="text-gray-600 mb-6 text-sm">
          {isTracking 
            ? "You are currently sharing your live location. Passengers can now track you on the map!" 
            : "Turn this on when you start driving so your passengers can track your live location."}
        </p>
        
        {isTracking ? (
          <button onClick={stopTracking} className="w-full sm:w-auto bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-8 rounded-xl transition flex justify-center items-center gap-2">
            <StopCircle size={24} /> Stop Broadcasting Location
          </button>
        ) : (
          <button onClick={startTracking} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md flex justify-center items-center gap-2">
            <Navigation size={24} /> Start Broadcasting Location
          </button>
        )}
      </div>

      {/* YOUR EXISTING ACTIVE ROUTES SECTION */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Routes</h2>
      
      {trips.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
          <p className="text-gray-500">You have no active routes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => {
            // Find bookings for this specific trip
            const tripBookings = bookings.filter(b => b.tripId === trip.id);
            
            return (
              <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-full text-[#185FA5]">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {trip.origin} <span className="text-gray-400 font-normal">→</span> {trip.destination}
                      </h3>
                      <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                    {trip.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#185FA5] font-bold mb-4">
                  <Users size={16} /> {trip.seatsAvailable} Seats Left
                </div>

                {/* BOOKED PASSENGERS LIST */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-gray-500" /> 
                    Booked Passengers ({tripBookings.length})
                  </h4>
                  
                  {tripBookings.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No passengers booked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {tripBookings.map((booking, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-gray-700">{booking.passengerEmail}</span>
                          {booking.type === "cargo" && (
                            <span className="ml-auto text-xs bg-orange-100 text-[#D35400] font-bold px-2 py-1 rounded">Cargo</span>
                          )}
                          {booking.type === "passenger" && (
                            <span className="ml-auto text-xs bg-blue-100 text-[#185FA5] font-bold px-2 py-1 rounded">{booking.seatsBooked} Seat(s)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}