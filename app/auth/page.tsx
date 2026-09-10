"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Bus, User, Car, Building2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("passenger");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // DIRECT SIGN-IN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch user role from Firestore to route them correctly
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "adda_owner") {
            router.push("/adda");
          } else if (userData.role === "driver") {
            router.push("/driver");
          } else {
            router.push("/search"); 
          }
        } else {
          router.push("/search"); 
        }

      } else {
        // SIGN-UP: Create Account + Save Role
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date().toISOString(),
        });
        
        // FIX: Log them out immediately so they have to sign in manually
        await signOut(auth);
        
        // Switch UI to login and show success message
        setIsLogin(true);
        setPassword(""); // Clear password for security
        setSuccess("Account created successfully! Please sign in.");
      }
      
    } catch (err: any) {
      console.error("Authentication Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#185FA5]">
            <Bus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome back to EasySafar" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Enter your email and password to sign in." : "Join as a Passenger, Driver, or Adda Owner."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">I am registering as a:</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setRole("passenger")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "passenger" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}>
                  <User size={20} className="mb-1" />
                  <span className="text-xs font-bold">Passenger</span>
                </button>
                <button type="button" onClick={() => setRole("driver")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "driver" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}>
                  <Car size={20} className="mb-1" />
                  <span className="text-xs font-bold">Driver</span>
                </button>
                <button type="button" onClick={() => setRole("adda_owner")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "adda_owner" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}>
                  <Building2 size={20} className="mb-1" />
                  <span className="text-xs font-bold text-center">Adda Owner</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-4 rounded-2xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} className="text-[#185FA5] hover:underline font-bold focus:outline-none">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}