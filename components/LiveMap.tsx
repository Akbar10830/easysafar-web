"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// This tells the map exactly where to show the pin!
export default function LiveMap({ lat, lng }: { lat: number, lng: number }) {
  
  useEffect(() => {
    // This fixes a known bug where standard map icons go missing in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* This is the FREE OpenStreetMap layer! */}
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* The Live Moving Pin */}
        <Marker position={[lat, lng]}>
          <Popup>Driver's Live Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}