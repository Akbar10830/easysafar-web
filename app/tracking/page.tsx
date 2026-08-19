"use client";
import { MapPin, Phone, Share2, Shield, Navigation, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function TrackingPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative bg-gray-200 overflow-hidden">
      
      {/* Mock Map Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50 bg-[#e5e7eb]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="text-center">
          <MapPin size={48} className="text-[#185FA5] mx-auto mb-2 animate-bounce" />
          <p className="font-bold text-gray-500 text-xl">Interactive Google Map Here</p>
        </div>
      </div>

      {/* Top Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Link href="/dashboard" className="bg-white p-3 rounded-full shadow-md text-gray-700 hover:bg-gray-50">
          &larr; Back
        </Link>
        <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-bold text-[#185FA5]">
          <Shield size={16} /> Insured Trip
        </div>
      </div>

      {/* Bottom Status Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-8 md:max-w-md md:mx-auto md:mb-6 md:rounded-3xl">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Driver is arriving</h2>
          <p className="text-[#0F6E56] font-bold flex items-center justify-center gap-1">
            <Navigation size={16} className="animate-pulse" /> 10 mins away
          </p>
        </div>

        {/* UPDATED: Driver Info with Phone Number & Message Button */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl shrink-0">
              👨🏽
            </div>
            <div>
              <p className="font-bold text-gray-900">Zaman Ali</p>
              <p className="text-xs text-gray-500 mb-1">Toyota Corolla • LEA-908</p>
              <p className="text-sm font-bold text-[#185FA5] tracking-wide">+92 300 1234567</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="w-10 h-10 bg-[#185FA5] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#124b82] transition">
              <Phone size={16} />
            </button>
            <button className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-green-700 transition">
              <MessageCircle size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 flex flex-col items-center">
              <div className="w-3 h-3 bg-[#185FA5] rounded-full"></div>
              <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
              <div className="w-3 h-3 bg-[#D35400] rounded-full"></div>
            </div>
            <div className="flex-1 py-1">
              <div className="h-10">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-bold text-gray-900 text-sm">Gilgit Bus Stand</p>
              </div>
              <div className="h-10 pt-2">
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-bold text-gray-900 text-sm">Islamabad G-9</p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition">
          <Share2 size={18} /> Share Trip Status
        </button>
      </div>

    </div>
  );
}