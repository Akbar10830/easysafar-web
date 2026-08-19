"use client";
import Link from "next/link";
import { PlusCircle, Bus } from "lucide-react";

export default function AddaDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adda Dashboard</h1>
          <p className="text-gray-500">Manage your terminals and vehicles</p>
        </div>
        <Link href="/adda/post" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition flex items-center gap-2">
          <PlusCircle size={20} /> Post New Vehicle
        </Link>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bus size={40} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to your Adda</h2>
        <p className="text-gray-500 mb-6">You haven't posted any vehicle schedules yet.</p>
        <Link href="/adda/post" className="inline-block bg-green-100 text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-200 transition-colors">
          Post your first route
        </Link>
      </div>
    </div>
  );
}