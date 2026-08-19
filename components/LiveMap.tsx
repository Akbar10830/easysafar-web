"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface DriverLocation {
  id: string;
  origin?: string;
  destination?: string;
  liveLat?: number;
  liveLng?: number;
  vehicleIdentifier?: string;
  vehicleType?: string;
}

export default function LiveMap() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);

  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "trips"));
        const activeList: DriverLocation[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.liveLat && data.liveLng) {
            activeList.push({ id: docSnap.id, ...data });
          }
        });
        setDrivers(activeList);
      } catch (error) {
        console.error("Error fetching live locations:", error);
      }
    };

    fetchActiveDrivers();
    const interval = setInterval(fetchActiveDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Live Active Fleet Map</h2>
      {drivers.length === 0 ? (
        <p className="text-gray-500 text-sm">No drivers or adda owners are currently broadcasting their location.</p>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">{driver.origin} → {driver.destination}</p>
                <p className="text-xs text-green-700 font-semibold">{driver.vehicleType} ({driver.vehicleIdentifier || "Active"})</p>
              </div>
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                Live GPS On
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}