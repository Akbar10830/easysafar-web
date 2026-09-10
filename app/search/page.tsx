"use client";
import { Suspense, useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Search as SearchIcon, Calendar, Clock, Users, Car, Bus, Building2, Truck, ArrowRightLeft, Sparkles, MapPin, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import LiveMap from "@/components/LiveMap"; 

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  totalSeats?: number;
  type?: string;
  vehicleType?: string;
  addaName?: string;
  phone?: string;
  driverPhone?: string;
  driverEmail?: string;
  status: string;
  luggage?: string;
  lat?: number;
  lng?: number;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-1">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchContent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Booking Modal State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seatsToBook, setSeatsToBook] = useState<number | "">(1);
  const [bookingType, setBookingType] = useState<"passenger" | "cargo">("passenger");

  // Map Modal State
  const [mapTrip, setMapTrip] = useState<Trip | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) setUserEmail(user.email);
    });
    
    fetchAndFilterTrips();

    return () => unsubscribe();
  }, [searchParams]);

  const fetchAndFilterTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const allTrips: Trip[] = [];
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const cutoffDate = threeDaysAgo.toISOString().split("T")[0];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "active" && data.date >= cutoffDate) {
          allTrips.push({ id: docSnap.id, ...data } as Trip);
        }
      });

      setTrips(allTrips);
      const urlFilter = searchParams.get("filter") || "all";
      setActiveFilter(urlFilter);
      applyFilterLogic(originQuery, destinationQuery, urlFilter, sortBy, allTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const applyFilterLogic = (origin: string, destination: string, filterType: string, sortType: string, currentTrips: Trip[], maxPrice?: number | null, requiredSeats?: number) => {
    let results = [...currentTrips];

    const cleanOrigin = origin.trim().toLowerCase();
    if (cleanOrigin) results = results.filter((trip) => trip.origin && trip.origin.toLowerCase().includes(cleanOrigin));

    const cleanDest = destination.trim().toLowerCase();
    if (cleanDest) results = results.filter((trip) => trip.destination && trip.destination.toLowerCase().includes(cleanDest));

    if (filterType === "car") {
      results = results.filter((trip) => trip.type !== "adda" && !trip.addaName);
    } else if (filterType === "van") {
      results = results.filter((trip) => trip.type === "adda" || trip.addaName);
    } else if (filterType === "full") {
      results = results.filter((trip) => trip.seatsAvailable === (trip.totalSeats || trip.seatsAvailable));
    } else if (filterType === "cargo") {
      results = results.filter((trip) => trip.type === "adda" || trip.addaName || trip.type === "cargo" || trip.luggage === "yes");
    }

    if (maxPrice) results = results.filter((trip) => trip.price <= maxPrice);
    if (requiredSeats && requiredSeats > 1) results = results.filter((trip) => trip.seatsAvailable >= requiredSeats);

    if (sortType === "price-asc") results.sort((a, b) => a.price - b.price);
    else if (sortType === "price-desc") results.sort((a, b) => b.price - a.price);
    else if (sortType === "date-asc") results.sort((a, b) => a.date.localeCompare(b.date));

    setFilteredTrips(results);
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (res.ok) {
        const newOrigin = data.from !== undefined ? data.from : originQuery;
        const newDest = data.to !== undefined ? data.to : destinationQuery;
        let currentSort = data.sortBy || sortBy;

        if (data.from !== undefined) setOriginQuery(data.from);
        if (data.to !== undefined) setDestinationQuery(data.to);
        if (data.sortBy) setSortBy(data.sortBy);
        if (data.passengers) setSeatsToBook(data.passengers);

        applyFilterLogic(newOrigin, newDest, activeFilter, currentSort, trips, data.maxPrice, data.passengers);
      }
    } catch (error) {
      console.error("AI search request failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = originQuery;
    setOriginQuery(destinationQuery);
    setDestinationQuery(temp);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilterLogic(originQuery, destinationQuery, activeFilter, sortBy, trips);
  };

  const handleFilterClick = (filterName: string) => {
    setActiveFilter(filterName);
    applyFilterLogic(originQuery, destinationQuery, filterName, sortBy, trips);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    setSortBy(sort);
    applyFilterLogic(originQuery, destinationQuery, activeFilter, sort, trips);
  };

  const handleBookTrip = async () => {
    if (!userEmail) {
      alert("Please sign in to book a ticket.");
      router.push("/auth");
      return;
    }
    if (!selectedTrip) return;
    if (selectedTrip.driverEmail === userEmail) {
      alert("You cannot book your own posted trip!");
      return;
    }

    const seatCount = typeof seatsToBook === "number" ? seatsToBook : 1;
    if (bookingType === "passenger" && seatCount > selectedTrip.seatsAvailable) {
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
        seatsBooked: bookingType === "passenger" ? seatCount : 0,
        totalPrice: bookingType === "passenger" ? selectedTrip.price * seatCount : selectedTrip.price,
        type: bookingType,
        bookedAt: new Date(),
      });

      if (bookingType === "passenger") {
        await updateDoc(doc(db, "trips", selectedTrip.id), { seatsAvailable: increment(-seatCount) });
      }

      alert("Booking Confirmed Successfully!");
      setSelectedTrip(null);
      router.push("/history");
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <SearchIcon className="text-[#185FA5]" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">Find Rides</h1>
      </div>

      {/* AI Search Box */}
      <div className="bg-gradient-to-r from-blue-900 to-[#185FA5] p-6 rounded-3xl shadow-lg text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-yellow-400" size={20} />
          <h2 className="font-black text-base">Ask EasySafar AI</h2>
        </div>
        <form onSubmit={handleAiSearch} className="space-y-3">
          <input 
            type="text" 
            placeholder="e.g., 'Find cheap rides from Danyore to Gilgit'" 
            value={aiPrompt} 
            onChange={(e) => setAiPrompt(e.target.value)} 
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-blue-200 text-sm outline-none focus:border-white/50 transition"
          />
          <button type="submit" disabled={isAiLoading} className="w-full bg-white text-[#185FA5] hover:bg-blue-50 font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition">
            <Sparkles size={16} /> {isAiLoading ? "Analyzing..." : "Search with AI"}
          </button>
        </form>
      </div>

      {/* Manual Search Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <form onSubmit={handleManualSearch} className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1">FROM</label>
            <input 
              type="text" 
              placeholder="Origin city" 
              value={originQuery}
              onChange={(e) => {
                setOriginQuery(e.target.value);
                applyFilterLogic(e.target.value, destinationQuery, activeFilter, sortBy, trips);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#185FA5]"
            />
          </div>
          
          <button 
            type="button" 
            onClick={handleSwap} 
            className="mt-4 p-3 bg-blue-50 text-[#185FA5] rounded-full hover:bg-blue-100 transition shrink-0"
          >
            <ArrowRightLeft size={20} />
          </button>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1">TO</label>
            <input 
              type="text" 
              placeholder="Destination city" 
              value={destinationQuery}
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                applyFilterLogic(originQuery, e.target.value, activeFilter, sortBy, trips);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#185FA5]"
            />
          </div>
        </form>
        <button 
          onClick={handleManualSearch} 
          className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3 rounded-2xl transition"
        >
          Search Available Trips
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <button 
          onClick={() => handleFilterClick("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition border ${activeFilter === "all" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          All Options
        </button>
        <button 
          onClick={() => handleFilterClick("car")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition border ${activeFilter === "car" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Car size={16} /> Private Cars
        </button>
        <button 
          onClick={() => handleFilterClick("van")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition border ${activeFilter === "van" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Bus size={16} /> Local Vans
        </button>
        <button 
          onClick={() => handleFilterClick("full")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition border ${activeFilter === "full" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Users size={16} /> Full Vehicle
        </button>
        <button 
          onClick={() => handleFilterClick("cargo")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition border ${activeFilter === "cargo" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Truck size={16} /> Cargo & Vans
        </button>
      </div>

      {/* Results Count & Sort Dropdown */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Showing {filteredTrips.length} Results
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white font-medium outline-none focus:border-[#185FA5]"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date-asc">Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Trip Results */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500 text-sm">
            No routes found for this search.
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                
                <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span><HighlightText text={trip.origin} query={originQuery} /></span>
                  <span className="text-gray-400">→</span>
                  <span><HighlightText text={trip.destination} query={destinationQuery} /></span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                  <span className="flex items-center gap-1 text-[#185FA5] font-bold"><Users size={14} /> {trip.seatsAvailable} seats</span>
                </div>

                {/* View Custom Map Button */}
                {trip.lat && trip.lng && (
                  <button 
                    onClick={() => setMapTrip(trip)}
                    className="mt-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 border border-green-200 hover:bg-green-100 transition"
                  >
                    <MapPin size={14} /> View Live Location
                  </button>
                )}
              </div>

              <div className="w-full md:w-auto flex justify-between items-center gap-3">
                <div className="text-xl font-black text-gray-900">Rs {trip.price}</div>
                <button 
                  onClick={() => {
                    setSelectedTrip(trip);
                    setSeatsToBook(typeof seatsToBook === "number" ? seatsToBook : 1);
                  }}
                  className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-6 py-2.5 rounded-2xl text-sm transition"
                >
                  Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOOKING MODAL */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
              <button onClick={() => setSelectedTrip(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-sm">
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
                  className={`py-3 rounded-2xl font-bold text-sm border-2 transition ${bookingType === "passenger" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-200 text-gray-500"}`}
                >
                  Passenger Seat
                </button>
                <button 
                  type="button"
                  onClick={() => setBookingType("cargo")}
                  className={`py-3 rounded-2xl font-bold text-sm border-2 transition ${bookingType === "cargo" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setSeatsToBook(val === "" ? "" : parseInt(val));
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none focus:border-[#185FA5]"
                />
              </div>
            )}

            <button 
              onClick={handleBookTrip}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition shadow-md"
            >
              Confirm Booking (Rs {bookingType === "passenger" ? selectedTrip.price * (typeof seatsToBook === "number" ? seatsToBook : 1) : selectedTrip.price})
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM MAP MODAL */}
      {mapTrip && mapTrip.lat && mapTrip.lng && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-green-600" size={18} /> Driver Location
              </h3>
              <button onClick={() => setMapTrip(null)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition">
                <X size={16} />
              </button>
            </div>
           <div className="w-full h-80 sm:h-96 bg-gray-100">
             <LiveMap 
  origin={mapTrip.origin} 
  destination={mapTrip.destination} 
  driverLocation={{ lat: mapTrip.lat as number, lng: mapTrip.lng as number }} 
/>
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center font-medium">
              Location fetched for route: {mapTrip.origin} to {mapTrip.destination}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-bold">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}