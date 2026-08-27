"use client";
import Link from "next/link";
import { MapPin, Search, ShieldCheck, Truck, Users } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-[#185FA5] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Seamless Travel & Cargo in Gilgit-Baltistan
          </h1>
          <p className="text-lg md:text-xl text-[#E6F1FB] mb-10">
            Connecting verified drivers with passengers and businesses. 
            Book a seat or send a truck with just a few clicks.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <MapPin className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Pickup City (e.g., Islamabad)" 
                className="bg-transparent w-full outline-none text-gray-800"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <MapPin className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Dropoff City (e.g., Skardu)" 
                className="bg-transparent w-full outline-none text-gray-800"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>
            <Link href="/search" className="bg-[#D35400] hover:bg-[#b04600] text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition">
              <Search size={20} /> Find Trips
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose EasySafar?</h2>
          <div className="w-24 h-1 bg-[#0F6E56] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-[#185FA5]" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Verified Captains</h3>
            <p className="text-gray-600">Every driver on our platform goes through strict background checks for your safety.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-[#D35400]" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Passenger Travel</h3>
            <p className="text-gray-600">Book single seats or full vehicles for your family. Travel comfortably across GB.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="text-[#0F6E56]" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Reliable Cargo</h3>
            <p className="text-gray-600">Ship anything from small parcels to full truckloads with real-time tracking.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Built for both sides of the journey.</h2>
              <p className="text-gray-600 text-lg mb-8">Whether you need to move goods or you own a vehicle looking for loads, EasySafar connects you instantly.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Create an Account</h4>
                    <p className="text-gray-600">Sign up using your phone number via secure OTP.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Choose your Role</h4>
                    <p className="text-gray-600">Switch between Customer Mode to book, or Driver Mode to accept trips.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Hit the Road</h4>
                    <p className="text-gray-600">Track shipments live on the map and process payments securely.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Dashboard Mockup Display Section */}
<div className="my-12 text-center space-y-4">
  <div className="inline-block bg-blue-50 text-[#185FA5] text-xs font-bold uppercase px-3 py-1 rounded-full">
    Platform Preview
  </div>
 
  
  <div className="max-w-md mx-auto p-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-6">
    <img 
      src="/Edit_2026-08-27 (1).png" 
      alt="EasySafar Dashboard Mockup" 
      className="w-full h-auto rounded-2xl object-cover"
    />
  </div>
</div>
            {/* <div className="bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center h-96 border-2 border-dashed border-gray-300">
              <span className="text-5xl mb-4">🚐</span>
              <p className="text-gray-500 font-medium">App Dashboard Interface Mockup</p>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}