"use client";
import { Car, MapPin } from "lucide-react";

interface LiveMapProps {
  origin?: string;
  destination?: string;
  driverLocation?: { lat: number; lng: number };
}

export default function LiveMap({ origin, destination, driverLocation }: LiveMapProps) {
  return (
    <div className="relative bg-blue-50 rounded-2xl h-80 flex flex-col items-center justify-center p-6 border border-blue-100 overflow-hidden text-center space-y-4 shadow-inner">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#185FA5_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
      
      <div className="relative z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-blue-100 flex items-center gap-3 text-xs font-bold text-gray-700">
        <span className="flex items-center gap-1 text-[#185FA5]"><MapPin size={14} /> {origin || "Origin"}</span>
        <span>→</span>
        <span className="flex items-center gap-1 text-green-600"><MapPin size={14} /> {destination || "Destination"}</span>
      </div>

      <div className="relative z-10 w-16 h-16 bg-[#185FA5] text-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
        <Car size={30} />
      </div>

      <div className="relative z-10 space-y-1">
        <h3 className="font-black text-gray-900 text-sm">Real-Time GPS Synchronization Active</h3>
        <p className="text-xs text-gray-500">
          {driverLocation ? `Lat: ${driverLocation.lat}, Lng: ${driverLocation.lng}` : "Awaiting driver GPS broadcast..."}
        </p>
      </div>
    </div>
  );
}