"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, ShieldCheck, Clock, Users, Car, Bus, Truck, 
  MapPin, Star, Download, Gift, HelpCircle, ArrowRight, CheckCircle2 
} from "lucide-react";

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-16">
      
      {/* 2. HERO SECTION - With Search Form Fitted at the Bottom */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat min-h-[520px] md:min-h-[580px] flex flex-col justify-between py-12 px-6 rounded-3xl overflow-hidden shadow-xl"
        style={{ backgroundImage: `url('/hero-banner.png')` }}
      >
        {/* Dark overlay for perfect contrast */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>

        {/* Hero Top Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center text-white space-y-4 pt-6">
          <span className="inline-block bg-blue-600 text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
            Private • Local • Cargo
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Travel Across Gilgit-Baltistan, Made Easy
          </h1>
          <p className="text-gray-200 text-sm md:text-base font-medium max-w-lg mx-auto">
            Connecting verified drivers with passengers and businesses across mountains and valleys.
          </p>
        </div>

        {/* Search Widget Fitted at the Bottom of Hero Banner */}
        <div className="relative z-20 max-w-2xl w-full mx-auto mt-6">
          <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-3 text-left border border-white/20">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pickup</label>
              <input 
                type="text" 
                placeholder="e.g., Gilgit, Skardu" 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm font-medium outline-none focus:border-[#185FA5]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Destination</label>
              <input 
                type="text" 
                placeholder="e.g., Hunza, Skardu" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm font-medium outline-none focus:border-[#185FA5]"
              />
            </div>
            <div className="md:col-span-2 pt-1">
              <button 
                type="submit" 
                className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Search size={16} /> Find Trips
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. TRUST BAR */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-700 font-bold text-xs md:text-sm">
          <CheckCircle2 className="text-green-600" size={18} /> Verified Drivers
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700 font-bold text-xs md:text-sm">
          <CheckCircle2 className="text-green-600" size={18} /> Transparent Prices
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700 font-bold text-xs md:text-sm">
          <CheckCircle2 className="text-green-600" size={18} /> Secure Booking
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-700 font-bold text-xs md:text-sm">
          <CheckCircle2 className="text-green-600" size={18} /> Local Support
        </div>
      </div>

    
      {/* 4. TRANSPORT SERVICES - Clickable to Filter Search */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 text-center">Our Transport Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div 
            onClick={() => router.push("/search?filter=car")}
            className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-2 shadow-sm hover:border-[#185FA5] transition cursor-pointer group"
          >
            <Car className="mx-auto text-[#185FA5] group-hover:scale-110 transition" size={32} />
            <h3 className="font-bold text-gray-900">Private Car</h3>
            <p className="text-xs text-gray-500">Comfortable individual rides</p>
          </div>

          <div 
            onClick={() => router.push("/search?filter=van")}
            className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-2 shadow-sm hover:border-green-600 transition cursor-pointer group"
          >
            <Bus className="mx-auto text-green-600 group-hover:scale-110 transition" size={32} />
            <h3 className="font-bold text-gray-900">Local Van</h3>
            <p className="text-xs text-gray-500">Affordable daily commute</p>
          </div>

          <div 
            onClick={() => router.push("/search?filter=full")}
            className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-2 shadow-sm hover:border-amber-600 transition cursor-pointer group"
          >
            <Users className="mx-auto text-amber-600 group-hover:scale-110 transition" size={32} />
            <h3 className="font-bold text-gray-900">Full Vehicle</h3>
            <p className="text-xs text-gray-500">Book for family tours</p>
          </div>

          <div 
            onClick={() => router.push("/search?filter=cargo")}
            className="bg-white p-6 rounded-2xl border border-gray-100 text-center space-y-2 shadow-sm hover:border-purple-600 transition cursor-pointer group"
          >
            <Truck className="mx-auto text-purple-600 group-hover:scale-110 transition" size={32} />
            <h3 className="font-bold text-gray-900">Cargo</h3>
            <p className="text-xs text-gray-500">Fast & secure goods delivery</p>
          </div>

        </div>
      </div>

      {/* 5. POPULAR ROUTES */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 space-y-4">
        <h2 className="text-xl font-black text-gray-900">Popular Routes Across GB</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["Islamabad → Skardu", "Gilgit → Hunza", "Gilgit → Skardu", "Hunza → Sust", "Gilgit → Phander", "Astore → Gilgit"].map((route, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 font-bold text-gray-800 text-sm flex items-center justify-between shadow-sm">
              <span>{route}</span>
              <ArrowRight size={16} className="text-[#185FA5]" />
            </div>
          ))}
        </div>
      </div>

      {/* 6. AVAILABLE TRIPS PREVIEW */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Live Active Trips</h2>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-500 space-y-2">
          <p>Looking for live trips? Browse all real-time departures posted by drivers.</p>
          <button 
            onClick={() => router.push("/search")}
            className="bg-[#185FA5] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#124b82] transition"
          >
            Browse Available Trips
          </button>
        </div>
      </div>

      {/* 7. HOW EASYSAFAR WORKS */}
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-black text-gray-900">How EasySafar Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-3xl font-black text-[#185FA5]">1</span>
            <h3 className="font-bold text-gray-900">Search</h3>
            <p className="text-xs text-gray-500">Enter your pickup and destination locations.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-3xl font-black text-[#185FA5]">2</span>
            <h3 className="font-bold text-gray-900">Choose</h3>
            <p className="text-xs text-gray-500">Select private cars, vans, or cargo space.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-3xl font-black text-[#185FA5]">3</span>
            <h3 className="font-bold text-gray-900">Book</h3>
            <p className="text-xs text-gray-500">Reserve your seats or cargo instantly.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-3xl font-black text-[#185FA5]">4</span>
            <h3 className="font-bold text-gray-900">Travel</h3>
            <p className="text-xs text-gray-500">Track trips live with real-time GPS maps.</p>
          </div>
        </div>
      </div>

      {/* 8. WHY EASYSAFAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <ShieldCheck className="mx-auto text-[#185FA5]" size={28} />
          <h3 className="font-bold text-gray-900 text-sm">Top Safety</h3>
          <p className="text-xs text-gray-500">Verified drivers & secure logging.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-2xl font-black text-green-600">Rs</span>
          <h3 className="font-bold text-gray-900 text-sm">Fair Prices</h3>
          <p className="text-xs text-gray-500">Transparent rates with no hidden fees.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <MapPin className="mx-auto text-amber-600" size={28} />
          <h3 className="font-bold text-gray-900 text-sm">Live Tracking</h3>
          <p className="text-xs text-gray-500">Track your transport on interactive maps.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <Users className="mx-auto text-purple-600" size={28} />
          <h3 className="font-bold text-gray-900 text-sm">24/7 Support</h3>
          <p className="text-xs text-gray-500">Dedicated assistance anytime you need.</p>
        </div>
      </div>

      {/* 9. EXPLORE GB */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 text-center">Explore Gilgit-Baltistan</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {["Hunza", "Skardu", "Gilgit", "Naltar", "Shigar"].map((place, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 font-bold text-gray-800 text-sm shadow-sm hover:bg-blue-50 transition cursor-pointer">
              {place}
            </div>
          ))}
        </div>
      </div>

      {/* 10. CUSTOMER REVIEWS */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="flex justify-center text-amber-400 gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
          </div>
          <h2 className="text-xl font-black text-gray-900">Trusted by Thousands of Travelers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600">
            &ldquo;EasySafar made traveling from Gilgit to Skardu completely stress-free. Loved the live tracking feature!&rdquo;
            <p className="font-bold text-gray-900 mt-2 text-xs">— Karim Khan, Tourist</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600">
            &ldquo;As a van driver, posting trips and getting booked passengers has never been easier.&rdquo;
            <p className="font-bold text-gray-900 mt-2 text-xs">— Amjad Ali, Driver</p>
          </div>
        </div>
      </div>

      {/* 11. BECOME A CAPTAIN */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-white/20 text-xs font-bold uppercase px-3 py-1 rounded-full">Driver Partnership</span>
          <h2 className="text-2xl font-black">Have a vehicle? Earn with EasySafar.</h2>
          <p className="text-orange-100 text-sm">Post your routes, manage seats, and connect directly with passengers and cargo shippers.</p>
        </div>
        <button 
          onClick={() => router.push("/driver")}
          className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-gray-100 transition text-sm whitespace-nowrap"
        >
          Join as Captain
        </button>
      </div>

      {/* 12. APP PROMOTION & DASHBOARD MOCKUP */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="bg-blue-50 text-[#185FA5] text-xs font-bold uppercase px-3 py-1 rounded-full">Mobile Ready</span>
          <h2 className="text-3xl font-black text-gray-900">Download EasySafar</h2>
          <p className="text-gray-500 text-sm">Access passenger bookings, live fleet maps, and instant cargo coordination right from your pocket.</p>
          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
              <Download size={16} /> Google Play
            </button>
            <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
              <Download size={16} /> App Store
            </button>
          </div>
        </div>
        <div className="max-w-xs mx-auto p-2 bg-gray-50 rounded-3xl shadow-inner border border-gray-100">
          <img 
            src="/dashboard-mockup.png" 
            alt="EasySafar App Dashboard Mockup" 
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      </div>

      {/* 13. STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-3xl font-black text-[#185FA5]">500+</span>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Drivers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-3xl font-black text-green-600">10k+</span>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Travelers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-3xl font-black text-amber-600">25+</span>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Routes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-3xl font-black text-purple-600">15k+</span>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Trips Completed</p>
        </div>
      </div>

      {/* 14. OFFER */}
      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Gift size={28} />
          </div>
          <div>
            <h3 className="font-black text-lg">First Booking Discount</h3>
            <p className="text-xs text-blue-100">Get 15% off your very first trip booked on EasySafar.</p>
          </div>
        </div>
        <button 
          onClick={() => router.push("/search")}
          className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow-sm hover:bg-blue-50 transition"
        >
          Claim Offer
        </button>
      </div>

      {/* 15. FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
            <h3 className="font-bold text-gray-900 text-sm">How do I track my ride live?</h3>
            <p className="text-xs text-gray-500">Once your booking is confirmed, go to your History page and click &quot;Track Live Location&quot; to see real-time GPS coordinates.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
            <h3 className="font-bold text-gray-900 text-sm">Can I send cargo parcels without traveling?</h3>
            <p className="text-xs text-gray-500">Yes! When booking or searching trips, select the &quot;Cargo Space&quot; option to ship packages securely with verified transporters.</p>
          </div>
        </div>
      </div>

      {/* 16. FINAL CTA */}
      <div className="text-center bg-gray-900 text-white p-12 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-3xl font-black">Ready to Start Your Journey?</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">Join EasySafar today and experience seamless passenger travel and cargo delivery across Gilgit-Baltistan.</p>
        <button 
          onClick={() => router.push("/search")}
          className="bg-[#185FA5] hover:bg-[#124b82] text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition text-sm"
        >
          Book Your Ride Now
        </button>
      </div>

      {/* 17. FOOTER */}
      <footer className="border-t border-gray-200 pt-8 text-center text-xs text-gray-500 space-y-2">
        <p className="font-bold text-gray-800 text-base">EasySafar</p>
        <p>© 2026 EasySafar. All rights reserved. Seamless Travel & Cargo in Gilgit-Baltistan.</p>
      </footer>

    </div>
  );
}