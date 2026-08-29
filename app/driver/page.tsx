"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { PlusCircle, Car, Calendar, Clock, Users, Trash2, MapPin, Phone, ArrowRight } from "lucide-react";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  phone: string;
  luggage?: string;
}

export default function DriverDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal State for posting a new trip
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [seatsAvailable, setSeatsAvailable] = useState<number | "">(4);
  const [phone, setPhone] = useState("");
  const [luggage, setLuggage] = useState("Standard Bag");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        router.push("/auth");
        return;
      }
      setUserEmail(user.email);
      fetchDriverTrips(user.email);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDriverTrips = async (email: string) => {
    try {
      const q = query(collection(db, "trips"), where("driverEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const userTrips: Trip[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "active") {
          userTrips.push({ id: docSnap.id, ...data } as Trip);
        }
      });
      setTrips(userTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "trips"), {
        driverEmail: userEmail,
        origin,
        destination,
        date,
        time,
        price: Number(price),
        seatsAvailable: Number(seatsAvailable),
        totalSeats: Number(seatsAvailable),
        phone,
        luggage,
        status: "active",
        createdAt: new Date(),
      });

      setIsModalOpen(false);
      setOrigin("");
      setDestination("");
      setDate("");
      setTime("");
      setPrice("");
      setSeatsAvailable(4);
      setPhone("");
      fetchDriverTrips(userEmail);
      alert("Trip posted successfully!");
    } catch (error) {
      console.error("Error posting trip:", error);
      alert("Failed to post trip.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteDoc(doc(db, "trips", tripId));
      if (userEmail) fetchDriverTrips(userEmail);
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  if (loading) {
    return <div className="text-center py-28 font-bold text-gray-500">Loading your captain dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#185FA5] to-blue-700 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/25 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Captain Portal</span>
          <h1 className="text-3xl font-black">Driver Dashboard</h1>
          <p className="text-blue-100 text-sm max-w-md">Manage your active routes, connect with passengers, and fill your seats effortlessly.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-[#185FA5] hover:bg-blue-50 font-black px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <PlusCircle size={18} /> + Post New Trip
        </button>
      </div>

      {/* Trips Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900">Your Active Routes</h2>

        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#185FA5] rounded-full flex items-center justify-center mx-auto">
              <Car size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">No active routes posted</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Post your upcoming travel route to let passengers book seats or cargo space.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              Post Your First Route
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 relative group hover:border-[#185FA5] transition">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-[#185FA5] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Car size={12} /> Active Trip
                  </span>
                  <button 
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-gray-400 hover:text-red-600 p-2 transition rounded-xl hover:bg-red-50"
                    title="Delete Route"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-lg font-black text-gray-900 flex items-center gap-2">
                  {trip.origin} <ArrowRight size={16} className="text-[#185FA5]" /> {trip.destination}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-2xl">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#185FA5]" /> {trip.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#185FA5]" /> {trip.time}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-[#185FA5]" /> {trip.seatsAvailable} Seats Left</span>
                  <span className="flex items-center gap-1.5 font-semibold text-gray-700">🧳 {trip.luggage || "Standard Bag"}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={12} /> {trip.phone}
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    Rs {trip.price} <span className="text-xs font-normal text-gray-500">/ seat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal for Posting Trip */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">Post a New Route</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handlePostTrip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pickup City</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Gilgit" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination City</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Skardu" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departure Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departure Time</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price per Seat (Rs)</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 1500" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Available Seats</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    value={seatsAvailable} 
                    onChange={(e) => setSeatsAvailable(e.target.value === "" ? "" : Number(e.target.value))} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 0300-1234567" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Luggage Allowance</label>
                  <select 
                    value={luggage} 
                    onChange={(e) => setLuggage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#185FA5]"
                  >
                    <option value="Standard Bag">Standard Backpack / Small Bag</option>
                    <option value="Large Suitcase Allowed">Large Suitcase Allowed</option>
                    <option value="Extra Cargo Space">Extra Cargo Space Available</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3.5 rounded-2xl transition shadow-md text-sm"
                >
                  {submitting ? "Posting..." : "Publish Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}