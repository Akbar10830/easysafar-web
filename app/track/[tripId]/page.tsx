"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import LiveMap from "@/components/LiveMap";

export default function LiveTrackingPage() {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;
      try {
        const docRef = doc(db, "trips", tripId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTripData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching trip for tracking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  if (loading) {
    return <div className="text-center py-24 font-bold text-gray-500">Loading live tracking...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#185FA5] transition"
      >
        <ArrowLeft size={16} /> Back to Bookings
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-5">
        <div className="flex justify-between items-center">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Trip Active
          </span>
          <span className="text-xs font-bold text-gray-400">Trip ID: {tripId}</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          {tripData?.origin} → {tripData?.destination}
        </h1>

        {/* LiveMap Component with Types Fixed */}
        <LiveMap 
          origin={tripData?.origin || ""} 
          destination={tripData?.destination || ""} 
          driverLocation={tripData?.currentLocation} 
        />

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Departure</p>
            <p className="font-bold text-gray-800">{tripData?.date} at {tripData?.time}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Driver Contact</p>
            <p className="font-bold text-gray-800 flex items-center justify-end gap-1">
              <Phone size={14} /> {tripData?.phone || tripData?.driverPhone || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}