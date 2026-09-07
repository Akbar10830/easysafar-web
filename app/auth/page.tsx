"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Bus, User, Car, Building2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("passenger"); // passenger | driver | adda
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isLogin && !name) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // DIRECT SIGN-IN: Email and Password only (No 6-digit OTP)
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/search");
      } else {
        // SIGN-UP: Keep old logic (Create user + save Role to Firestore)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the user's role and details to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          role: role,
          createdAt: new Date().toISOString(),
        });

        router.push("/search");
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pb-24">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#185FA5]">
            <Bus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome back" : "Join EasySafar"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Sign in to your account to continue." : "Create an account to book or post rides."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* SIGN UP ONLY: Name and Role Selection */}
          {!isLogin && (
            <>
              {/* <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ali Khan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
                  required={!isLogin}
                />
              </div> */}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("passenger")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "passenger" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <User size={20} className="mb-1" />
                    <span className="text-xs font-bold">Passenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("driver")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "driver" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Car size={20} className="mb-1" />
                    <span className="text-xs font-bold">Driver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("adda")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${role === "adda" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Building2 size={20} className="mb-1" />
                    <span className="text-xs font-bold">Adda owner</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SHARED FIELDS: Email and Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-4 rounded-2xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center text-sm font-medium text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); 
            }}
            className="text-[#185FA5] hover:underline font-bold focus:outline-none"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}