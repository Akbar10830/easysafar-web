"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Clock, CheckCircle2, Ticket, Trash2, Car, Package, Navigation, X } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// IMPORTANT: We dynamically import the map so it only loads in the browser!
const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-500">Loading Map...</div> });

export default function HistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // LIVE TRACKING STATES
  const [trackingTripId, setTrackingTripId] = useState<string | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const bookingsRef = collection(db, "bookings");
          const q = query(bookingsRef, where("passengerEmail", "==", user.email));
          const querySnapshot = await getDocs(q);
          
          const fetchedBookings: any[] = [];
          querySnapshot.forEach((docSnap) => {
            fetchedBookings.push({ id: docSnap.id, ...docSnap.data() });
          });
          
          fetchedBookings.sort((a, b) => {
            if (!a.bookedAt || !b.bookedAt) return 0;
            return b.bookedAt.toMillis() - a.bookedAt.toMillis();
          });

          setBookings(fetchedBookings);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // LISTEN FOR LIVE GPS UPDATES FROM FIREBASE
  useEffect(() => {
    let unsubscribeTrip: any = null;

    if (trackingTripId) {
      const tripRef = doc(db, "trips", trackingTripId);
      // onSnapshot listens to the database in real-time!
      unsubscribeTrip = onSnapshot(tripRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.liveLat && data.liveLng) {
            setLiveLocation({ lat: data.liveLat, lng: data.liveLng });
          } else {
            setLiveLocation(null); // Driver hasn't broadcasted yet
          }
        }
      });
    }

    return () => {
      if (unsubscribeTrip) unsubscribeTrip();
    };
  }, [trackingTripId]);

  const handleDelete = async (bookingId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      alert("Failed to delete the booking.");
    }
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="text-[#185FA5]" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-green-500 border border-gray-200 relative overflow-hidden">
            
            <button onClick={() => handleDelete(booking.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 z-10">
              <Trash2 size={20} />
            </button>

            <div className="flex justify-between items-start mb-4 pr-10 relative z-10">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                      <CheckCircle2 size={12} /> Confirmed
                    </span>
                    {booking.type === "cargo" ? (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-[#D35400] text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                        <Package size={12} /> Cargo Space
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-[#185FA5] text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                        <Car size={12} /> Passenger 
                        <span className="font-black bg-[#185FA5] text-white px-1.5 rounded ml-1">{booking.seatsBooked || 1}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                    {booking.origin} to {booking.destination}
                  </div>
               </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Date & Time</span>
                    <span className="text-gray-900 font-bold flex items-center gap-2"><Calendar size={16} className="text-[#185FA5]"/> {booking.date}, {booking.time}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Bill</span>
                    <span className="text-gray-900 font-black text-lg">
                      {booking.totalPrice && booking.totalPrice > 0 ? `Rs ${booking.totalPrice}` : 'Free'}
                    </span>
                </div>
                 <div className="flex flex-col col-span-2 pt-2 border-t border-gray-200 mt-2">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Driver Contact</span>
                    <span className="text-gray-900 font-medium">{booking.driverPhone}</span>
                </div>
            </div>

            {/* TRACK DRIVER BUTTON */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {trackingTripId === booking.tripId ? (
                <div className="space-y-4">
                  <button onClick={() => setTrackingTripId(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                    <X size={20} /> Close Map
                  </button>
                  
                  {liveLocation ? (
                    <LiveMap lat={liveLocation.lat} lng={liveLocation.lng} />
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center">
                      <Navigation size={32} className="text-[#185FA5] mx-auto mb-2 animate-bounce" />
                      <p className="text-[#185FA5] font-bold">Waiting for Driver...</p>
                      <p className="text-blue-600 text-sm mt-1">The Driver hasn't started broadcasting their location yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setTrackingTripId(booking.tripId)} className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                  <Navigation size={20} /> Track Driver
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}