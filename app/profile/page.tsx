"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield, FileText, ChevronRight, X, Mail, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user role data:", error);
        }
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {user && (
        <div className="space-y-4">
          
          {/* USER INFO CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 text-center relative overflow-hidden">
            <span className="absolute top-4 right-4 bg-blue-100 text-[#185FA5] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {userData?.role || "Passenger"}
            </span>

            <div className="w-20 h-20 bg-blue-50 text-[#185FA5] rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={36} />
            </div>

            <h2 className="font-bold text-lg text-gray-900 mb-1">{user.email}</h2>
            <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
              <CheckCircle size={12} className="text-green-500" /> Verified Account
            </p>
          </div>

          {/* EXTRA OPTIONS SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition border-b border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-50 text-green-600 p-2.5 rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Privacy Policy</p>
                  <p className="text-xs text-gray-400">Data usage & GPS safety terms</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-[#185FA5] p-2.5 rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">App Version</p>
                  <p className="text-xs text-gray-400">EasySafar v1.0.0 Live</p>
                </div>
              </div>
            </div>

          </div>

          {/* SIGN OUT BUTTON */}
          <button 
            onClick={handleSignOut}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition flex justify-center items-center gap-2"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      {/* PRIVACY POLICY POPUP MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="text-green-600" size={24} /> Privacy Policy
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                Welcome to <strong>EasySafar</strong>. We respect your privacy and are committed to protecting your personal information.
              </p>
              <h4 className="font-bold text-gray-800 pt-1">1. Location Data Collection</h4>
              <p>
                When drivers or captains turn on the live broadcast feature, EasySafar collects real-time GPS data to display vehicle positions to active passengers on the map. This data is only transmitted during active trips and is never stored permanently.
              </p>
              <h4 className="font-bold text-gray-800 pt-1">2. Account Information</h4>
              <p>
                We only store your email address and selected user role (Passenger, Driver, or Adda Owner) for authentication and ticket management purposes. We do not sell or share your data with third parties.
              </p>
              <h4 className="font-bold text-gray-800 pt-1">3. Security</h4>
              <p>
                All user authentication is securely handled via industry-standard Firebase security protocols.
              </p>
            </div>

            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-3 rounded-xl transition mt-4"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}