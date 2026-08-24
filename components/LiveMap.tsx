"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// @ts-ignore
import L from "leaflet";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DriverLocation {
  id: string;
  origin?: string;
  destination?: string;
  liveLat?: number;
  liveLng?: number;
  vehicleType?: string;
  vehicleIdentifier?: string;
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
            activeList.push({ id: docSnap.id, ...data } as DriverLocation);
          }
        });
        setDrivers(activeList);
      } catch (error) {
        console.error("Error fetching live locations:", error);
      }
    };

    fetchActiveDrivers();
  }, []);

  const defaultCenter: [number, number] = [35.9208, 74.3087];

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden shadow-inner relative z-10">
      <MapContainer center={defaultCenter} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map((driver) => {
          if (!driver.liveLat || !driver.liveLng) return null;
          return (
            <Marker key={driver.id} position={[driver.liveLat, driver.liveLng]} icon={customIcon}>
              <Popup>
                <div className="text-xs font-bold">
                  <p>{driver.origin} → {driver.destination}</p>
                  <p className="text-green-600">{driver.vehicleType || "Vehicle"} ({driver.vehicleIdentifier || "Active"})</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}