"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    setLoading(true);

    try {
      if (isLogin) {
        // Direct Sign-In (No 6-digit code)
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Direct Account Creation (No 6-digit code)
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Redirect back to search page upon successful login/signup
      router.push("/search");
      
    } catch (err: any) {
      console.error("Authentication Error:", err);
      // Simplify Firebase error messages for the user
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
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#185FA5]">
            <Bus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome back to EasySafar" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Enter your email and password to sign in." : "Sign up quickly with just an email and password."}
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5">
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
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
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