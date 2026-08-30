"use client";
import { Suspense, useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Search as SearchIcon, Calendar, Clock, Users, Car, Bus, Phone, Building2, Truck, ArrowRightLeft, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
  title?: string;
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

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Booking Modal State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seatsToBook, setSeatsToBook] = useState<number | "">(1);
  const [bookingType, setBookingType] = useState<"passenger" | "cargo">("passenger");
  
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

    // 1. Origin Filter
    const cleanOrigin = origin.trim().toLowerCase();
    if (cleanOrigin) {
      results = results.filter((trip) => trip.origin && trip.origin.toLowerCase().includes(cleanOrigin));
    }

    // 2. Destination Filter
    const cleanDest = destination.trim().toLowerCase();
    if (cleanDest) {
      results = results.filter((trip) => trip.destination && trip.destination.toLowerCase().includes(cleanDest));
    }

    // 3. Category & Adda Filters
    if (filterType === "car") {
      results = results.filter((trip) => trip.type !== "adda" && !trip.addaName);
    } else if (filterType === "van") {
      results = results.filter((trip) => trip.type === "adda" || trip.addaName);
    } else if (filterType === "full") {
      results = results.filter((trip) => {
        const total = trip.totalSeats || trip.seatsAvailable;
        return trip.seatsAvailable === total;
      });
    } else if (filterType === "cargo") {
      results = results.filter((trip) => trip.type === "adda" || trip.addaName || trip.type === "cargo");
    }

    // 4. Max Price / Budget Filter
    if (maxPrice) {
      results = results.filter((trip) => trip.price <= maxPrice);
    }

    // 5. Available Seats Filter
    if (requiredSeats && requiredSeats > 1) {
      results = results.filter((trip) => trip.seatsAvailable >= requiredSeats);
    }

    // 6. Sorting Logic
    if (sortType === "price-asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortType === "price-desc") {
      results.sort((a, b) => b.price - a.price);
    } else if (sortType === "date-asc") {
      results.sort((a, b) => a.date.localeCompare(b.date));
    }

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
      } else {
        alert(data.error || "AI could not parse your query.");
      }
    } catch (error) {
      console.error("AI search request failed:", error);
      alert("Something went wrong with AI search.");
    } finally {
      setIsAiLoading(false);
    }
  };
  const handleSwapLocations = () => {
    const temp = originQuery;
    setOriginQuery(destinationQuery);
    setDestinationQuery(temp);
    applyFilterLogic(destinationQuery, temp, activeFilter, sortBy, trips);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilterLogic(originQuery, destinationQuery, activeFilter, sortBy, trips);
  };

  const handleCategoryClick = (category: string) => {
    setActiveFilter(category);
    router.push(`/search?filter=${category}`, { scroll: false });
    applyFilterLogic(originQuery, destinationQuery, category, sortBy, trips);
  };

  const handleSortChange = (sortType: string) => {
    setSortBy(sortType);
    applyFilterLogic(originQuery, destinationQuery, activeFilter, sortType, trips);
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
        driverPhone: selectedTrip.phone || selectedTrip.driverPhone || "N/A",
        bookedAt: new Date(),
      });

      if (bookingType === "passenger") {
        const tripRef = doc(db, "trips", selectedTrip.id);
        await updateDoc(tripRef, {
          seatsAvailable: increment(-seatCount)
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
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <SearchIcon className="text-[#185FA5]" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">Find Rides & Vans</h1>
      </div>

      {/* AI-Powered Trip Search Box */}
      <div className="bg-gradient-to-r from-blue-900 to-[#185FA5] p-6 rounded-3xl shadow-lg text-white space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={20} />
          <h2 className="font-black text-base">Ask EasySafar AI</h2>
        </div>
        <form onSubmit={handleAiSearch} className="space-y-3">
          <input 
            type="text" 
            placeholder="e.g., 'Find cheap private cars from Islamabad to Lahore'" 
            value={aiPrompt} 
            onChange={(e) => setAiPrompt(e.target.value)} 
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-blue-200 text-sm outline-none focus:bg-white/20 transition"
          />
          <button 
            type="submit" 
            disabled={isAiLoading}
            className="w-full bg-white text-[#185FA5] hover:bg-blue-50 font-black py-3 rounded-2xl transition shadow-md text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> {isAiLoading ? "AI is analyzing route..." : "Search with AI"}
          </button>
        </form>
      </div>

      {/* Traditional Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
            <input 
              type="text" 
              placeholder="Origin city" 
              value={originQuery} 
              onChange={(e) => {
                setOriginQuery(e.target.value);
                applyFilterLogic(e.target.value, destinationQuery, activeFilter, sortBy, trips);
              }} 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
            />
          </div>

          <div className="md:col-span-2 flex justify-center pt-2 md:pt-6">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-[#185FA5] rounded-2xl transition border border-blue-100 shadow-sm"
              title="Swap From and To"
            >
              <ArrowRightLeft size={18} />
            </button>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
            <input 
              type="text" 
              placeholder="Destination city" 
              value={destinationQuery} 
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                applyFilterLogic(originQuery, e.target.value, activeFilter, sortBy, trips);
              }} 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3.5 rounded-2xl transition shadow-sm text-sm">
          Search Available Trips
        </button>
      </form>

      {/* Interactive Category Filter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          onClick={() => handleCategoryClick("all")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border ${activeFilter === "all" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          All Options
        </button>
        <button
          onClick={() => handleCategoryClick("car")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-1.5 ${activeFilter === "car" ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Car size={14} /> Private Cars
        </button>
        <button
          onClick={() => handleCategoryClick("van")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-1.5 ${activeFilter === "van" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Bus size={14} /> Local Vans
        </button>
        <button
          onClick={() => handleCategoryClick("full")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-1.5 ${activeFilter === "full" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Users size={14} /> Full Vehicle
        </button>
        <button
          onClick={() => handleCategoryClick("cargo")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-1.5 col-span-2 md:col-span-1 ${activeFilter === "cargo" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Truck size={14} /> Cargo & Vans
        </button>
      </div>

      {/* Sort Dropdown Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Showing {filteredTrips.length} results
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#185FA5]"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="date-asc">Earliest Date</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500 text-sm">
            No active routes found matching this query.
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {trip.type === "adda" || trip.addaName ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Bus size={12} /> Adda Van ({trip.vehicleType || "Standard"})
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-[#185FA5] text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Car size={12} /> Private Car
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-500 text-xs flex items-center gap-1"><Users size={12} /> {trip.seatsAvailable} seats left</span>
                </div>

                {/* Highlighted Match Text */}
                <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span><HighlightText text={trip.origin} query={originQuery} /></span>
                  <span className="text-gray-400">→</span>
                  <span><HighlightText text={trip.destination} query={destinationQuery} /></span>
                </div>

                {trip.addaName && (
                  <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                    <Building2 size={14} /> {trip.addaName}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-700">🧳 {trip.luggage || "Standard Bag"}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {trip.phone || trip.driverPhone || "N/A"}</span>
                </div>
              </div>

              <div className="w-full md:w-auto flex md:flex-col justify-between items-center md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-xl font-black text-gray-900">
                  Rs {trip.price} <span className="text-xs font-normal text-gray-500">/ seat</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTrip(trip);
                    setSeatsToBook(typeof seatsToBook === "number" ? seatsToBook : 1);
                  }}
                  className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-6 py-2.5 rounded-2xl transition text-sm shadow-sm"
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
                  placeholder="Enter seats"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5]"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedTrip(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBookTrip}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition shadow-md"
              >
                Confirm (Rs {bookingType === "passenger" ? selectedTrip.price * (typeof seatsToBook === "number" ? seatsToBook : 1) : selectedTrip.price})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-bold text-gray-500">Loading search options...</div>}>
      <SearchContent />
    </Suspense>
  );
}