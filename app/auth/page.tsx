"use client";
import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, Car, Bus, Loader2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("passenger");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !agreedToPrivacy) {
      alert("You must agree to the Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          if (userRole === "captain") router.push("/driver");
          else if (userRole === "adda_owner") router.push("/adda");
          else router.push("/");
        } else {
          router.push("/");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: role,
          createdAt: new Date(),
        });

        if (role === "captain") router.push("/driver");
        else if (role === "adda_owner") router.push("/adda");
        else router.push("/");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#185FA5] mb-2">EasySafar</h1>
          <p className="text-gray-500">{isLogin ? "Welcome back!" : "Create your account"}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {!isLogin && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setRole("passenger")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === "passenger" ? "border-[#185FA5] bg-blue-50 text-[#185FA5]" : "border-gray-100 bg-gray-50 text-gray-500"}`}
              >
                <User size={24} className="mb-1" />
                <span className="text-xs font-bold">Passenger</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole("captain")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === "captain" ? "border-[#D35400] bg-orange-50 text-[#D35400]" : "border-gray-100 bg-gray-50 text-gray-500"}`}
              >
                <Car size={24} className="mb-1" />
                <span className="text-xs font-bold">Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("adda_owner")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === "adda_owner" ? "border-green-600 bg-green-50 text-green-600" : "border-gray-100 bg-gray-50 text-gray-500"}`}
              >
                <Bus size={24} className="mb-1" />
                <span className="text-[10px] font-bold text-center leading-tight">Adda<br/>Owner</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
           <input 
  type="email" 
  placeholder="Enter your email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-[#185FA5] transition"
/>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 font-medium border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#185FA5]"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 pt-2">
              <input 
                type="checkbox" 
                id="privacy" 
                required
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#185FA5] focus:ring-[#185FA5]"
              />
              <label htmlFor="privacy" className="text-xs text-gray-600 leading-relaxed">
                I agree to the <span className="text-[#185FA5] font-bold">Privacy Policy</span>, including the collection and real-time processing of location data for travel verification.
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#185FA5] hover:bg-[#124b82] text-white font-bold py-4 rounded-xl transition shadow-md flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#185FA5] font-bold ml-2 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}