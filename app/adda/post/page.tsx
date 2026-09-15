"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Bus, MapPin, Calendar, Clock, Users, Banknote, Building2, Phone, Hash } from "lucide-react";

export default function AddaPostPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    addaName: "",
    phone: "", 
    vehicleIdentifier: "Van #1", 
    vehicleType: "Hiace Van",
    origin: "",
    destination: "",
    date: "",
    time: "",
    seatsAvailable: "14",
    price: "",
  });

  // Safely calculate local Date Limits (Today to 3 days from now)
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const minDate = getLocalDateString(today);
  
  const max = new Date();
  max.setDate(max.getDate() + 3);
  const maxDate = getLocalDateString(max);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
      else router.push("/auth");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return alert("Please log in first!");

    // 1. EXACT 11-DIGIT PHONE VALIDATION
    const cleanPhone = formData.phone.trim();
    if (cleanPhone.length !== 11 || !/^\d+$/.test(cleanPhone)) {
      alert("Error: Phone number must be exactly 11 digits (e.g., 03001234567).");
      return; 
    }

    // 2. BULLETPROOF PAST TIME VALIDATION
    const now = new Date();
    const localHours = String(now.getHours()).padStart(2, '0');
    const localMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeString = `${localHours}:${localMinutes}`;

    // If the selected date is today, the time MUST be greater than current time
    if (formData.date === minDate && formData.time <= currentTimeString) {
      alert("Error: You cannot schedule a trip in the past. Please select a future time for today.");
      return;
    }

    try {
      await addDoc(collection(db, "trips"), {
        ...formData,
        phone: cleanPhone,
        driverEmail: userEmail,
        seatsAvailable: parseInt(formData.seatsAvailable),
        totalSeats: parseInt(formData.seatsAvailable),
        price: parseInt(formData.price),
        status: "active",
        type: "adda", 
        createdAt: new Date(),
      });
      
      alert("Vehicle Posted Successfully! You can now post the next vehicle.");
      
      setFormData(prev => ({
        ...prev,
        vehicleIdentifier: "Van #" + (parseInt(prev.vehicleIdentifier.replace(/\D/g, "")) + 1 || 2)
      }));
      
      router.push("/adda"); 
    } catch (error) {
      console.error("Error posting adda trip:", error);
      alert("Failed to post vehicle.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-100 p-3 rounded-xl text-green-700">
          <Bus size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post Terminal Vehicle</h1>
          <p className="text-gray-500">Upload multiple vehicle departures as they line up</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Building2 size={16}/> Adda / Terminal Name</label>
            <input type="text" required placeholder="e.g. Gilgit General Stand" value={formData.addaName} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, addaName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Phone size={16}/> Terminal Phone Number</label>
            <input type="tel" required placeholder="03001234567" value={formData.phone} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Hash size={16}/> Vehicle / Dispatch Tag</label>
            <input type="text" required placeholder="e.g. Van #1 or Coaster A" value={formData.vehicleIdentifier} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, vehicleIdentifier: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Bus size={16}/> Vehicle Type</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}>
              <option value="Hiace Van">Hiace Van (18 Seats)</option>
              <option value="Coaster">Coaster (22 Seats)</option>
              <option value="Minibus">Minibus (30+ Seats)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> From (Origin)</label>
            <input type="text" required value={formData.origin} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, origin: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16}/> To (Destination)</label>
            <input type="text" required value={formData.destination} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, destination: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Calendar size={16}/> Date</label>
            <input type="date" required min={minDate} max={maxDate} value={formData.date} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Clock size={16}/> Departure Time</label>
            <input type="time" required value={formData.time} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Users size={16}/> Total Seats</label>
            <input type="number" required value={formData.seatsAvailable} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, seatsAvailable: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Banknote size={16}/> Price per Seat (Rs)</label>
            <input type="number" required value={formData.price} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" onChange={(e) => setFormData({...formData, price: e.target.value})} />
          </div>
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-md">
          Post Vehicle & Add Another
        </button>
      </form>
    </div>
  );
}