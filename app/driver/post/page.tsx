"use client";
import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, Users, Package, CheckCircle2, Phone, Banknote } from "lucide-react";
import { db, auth } from "../../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function PostTripPage() {
  const router = useRouter();
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [driverPhone, setDriverPhone] = useState(""); 
  const [acceptPassengers, setAcceptPassengers] = useState(true);
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState(""); // NEW: Price state
  const [acceptCargo, setAcceptCargo] = useState(false);
  const [cargoWeight, setCargoWeight] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tripsCollection = collection(db, "trips");

      await addDoc(tripsCollection, {
        driverEmail: userEmail,
        driverPhone: driverPhone,
        origin: origin,
        destination: destination,
        date: date,
        time: time,
        acceptPassengers: acceptPassengers,
        seatsAvailable: acceptPassengers ? Number(seats) : 0,
        pricePerSeat: price ? Number(price) : 0, // NEW: Save price to DB
        acceptCargo: acceptCargo,
        cargoCapacityKg: acceptCargo ? Number(cargoWeight) : 0,
        status: "active",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/driver");
      }, 2000);

    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to post trip.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center mt-12">
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Posted!</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Trip</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Number</h2>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
            <Phone className="text-green-600 mr-2" size={20} />
            <input type="tel" required value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="03001234567" className="w-full outline-none bg-transparent" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Route & Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
              <MapPin className="text-[#185FA5] mr-2" size={20} />
              <input type="text" required value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Leaving from" className="w-full outline-none bg-transparent" />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
              <MapPin className="text-[#D35400] mr-2" size={20} />
              <input type="text" required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Going to" className="w-full outline-none bg-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
                <Calendar className="text-gray-400 mr-2" size={20} />
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full outline-none bg-transparent text-gray-600" />
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
                <Clock className="text-gray-400 mr-2" size={20} />
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full outline-none bg-transparent text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* NEW: PRICE SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing (Optional)</h2>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#185FA5] transition-colors">
            <Banknote className="text-gray-400 mr-2" size={20} />
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price per seat in Rs (Leave empty for Free)" className="w-full outline-none bg-transparent" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-[#185FA5] rounded-full flex items-center justify-center"><Users size={20} /></div>
              <div>
                <p className="font-bold text-gray-900">Accepting Passengers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {acceptPassengers && (
                <input type="number" required min="1" max="15" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="Seats" className="w-20 outline-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-center" />
              )}
              <button type="button" onClick={() => setAcceptPassengers(!acceptPassengers)} className={`w-14 h-8 rounded-full transition-colors relative ${acceptPassengers ? 'bg-green-400' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${acceptPassengers ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 text-[#D35400] rounded-full flex items-center justify-center"><Package size={20} /></div>
              <div>
                <p className="font-bold text-gray-900">Accepting Cargo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {acceptCargo && (
                <input type="number" required min="1" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} placeholder="kg" className="w-20 outline-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-center" />
              )}
              <button type="button" onClick={() => setAcceptCargo(!acceptCargo)} className={`w-14 h-8 rounded-full transition-colors relative ${acceptCargo ? 'bg-green-400' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${acceptCargo ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-4 rounded-xl transition shadow-md disabled:bg-gray-400">
          {isSubmitting ? "Publishing Trip..." : "Publish Trip"}
        </button>
      </form>
    </div>
  );
}