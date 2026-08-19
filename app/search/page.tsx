"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Search as SearchIcon, MapPin, Calendar, Clock, Users, Banknote, Car, Bus, Phone, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Booking Modal State
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingType, setBookingType] = useState<"passenger" | "cargo">("passenger");
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
    });
    fetchTrips();
    return () => unsubscribe();
  }, []);

  const fetchTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const allTrips: any[] = [];
      const today = new Date().toISOString().split("T")[0];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "active" && data.date >= today) {
          allTrips.push({ id: docSnap.id, ...data });
        }
      });

      setTrips(allTrips);
      setFilteredTrips(allTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = trips.filter((trip) => {
      const matchOrigin = trip.origin.toLowerCase().includes(originQuery.toLowerCase());
      const matchDest = trip.destination.toLowerCase().includes(destinationQuery.toLowerCase());
      return matchOrigin && matchDest;
    });
    setFilteredTrips(results);
  };

  const handleBookTrip = async () => {
    if (!userEmail) {
      alert("Please sign in to book a ticket.");
      router.push("/auth");
      return;
    }

    if (!selectedTrip) return;

    if (bookingType === "passenger" && seatsToBook > selectedTrip.seatsAvailable) {
      alert("Not enough seats available!");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        tripId: selectedTrip.id,
        passengerEmail: userEmail,
        origin: selectedTrip.origin,
        destination: selectedTrip.destination,
        date: selectedTrip.date,
        time: selectedTrip.time,
        seatsBooked: bookingType === "passenger" ? seatsToBook : 0,
        totalPrice: bookingType === "passenger" ? selectedTrip.price * seatsToBook : selectedTrip.price,
        type: bookingType,
        driverPhone: selectedTrip.phone || selectedTrip.driverPhone || "N/A",
        bookedAt: new Date(),
      });

      if (bookingType === "passenger") {
        const tripRef = doc(db, "trips", selectedTrip.id);
        await updateDoc(tripRef, {
          seatsAvailable: increment(-seatsToBook)
        });
      }

      alert("Booking Confirmed Successfully!");
      setSelectedTrip(null);
      router.push("/history");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to complete booking.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon className="text-[#185FA5]" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">Find Rides & Vans</h1>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
            <input 
              type="text" 
              placeholder="Origin city" 
              value={originQuery} 
              onChange={(e) => setOriginQuery(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
            <input 
              type="text" 
              placeholder="Destination city" 
              value={destinationQuery} 
              onChange={(e) => setDestinationQuery(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3 rounded-xl transition">
          Search Available Options
        </button>
      </form>

      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
            No active or upcoming routes found matching your search.
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {trip.type === "adda" ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Bus size={12} /> Adda Van ({trip.vehicleType})
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-[#185FA5] text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Car size={12} /> Private Car
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-500 text-xs flex items-center gap-1"><Users size={12} /> {trip.seatsAvailable} seats left</span>
                </div>

                <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {trip.origin} <span className="text-gray-400">→</span> {trip.destination}
                </div>

                {trip.addaName && (
                  <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                    <Building2 size={14} /> {trip.addaName}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {trip.phone || trip.driverPhone || "N/A"}</span>
                </div>
              </div>

              <div className="w-full md:w-auto flex md:flex-col justify-between items-center md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-xl font-black text-gray-900">
                  Rs {trip.price} <span className="text-xs font-normal text-gray-500">/ seat</span>
                </div>
                <button 
                  onClick={() => setSelectedTrip(trip)}
                  className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Confirm Your Booking</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
              <p className="font-bold text-gray-800">{selectedTrip.origin} to {selectedTrip.destination}</p>
              <p className="text-gray-500">Date: {selectedTrip.date} at {selectedTrip.time}</p>
              <p className="text-gray-500">Price: Rs {selectedTrip.price} per seat</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Select Booking Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setBookingType("passenger")}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition ${bookingType === "passenger" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-200 text-gray-500"}`}
                >
                  Passenger Seat
                </button>
                <button 
                  type="button"
                  onClick={() => setBookingType("cargo")}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition ${bookingType === "cargo" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}
                >
                  Cargo Space
                </button>
              </div>
            </div>

            {bookingType === "passenger" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Seats</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedTrip.seatsAvailable} 
                  value={seatsToBook} 
                  onChange={(e) => setSeatsToBook(parseInt(e.target.value) || 1)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedTrip(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBookTrip}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-md"
              >
                Confirm (Rs {bookingType === "passenger" ? selectedTrip.price * seatsToBook : selectedTrip.price})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}