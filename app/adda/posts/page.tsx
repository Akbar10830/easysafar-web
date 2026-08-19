"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Bus, MapPin, Calendar, Clock, Users, Banknote, Building2, Phone, Navigation, StopCircle, Trash2, Hash } from "lucide-react";

export default function AddaMyPostsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // LIVE TRACKING STATES
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchMyPosts(user.email);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMyPosts = async (email: string) => {
    try {
      const q = query(collection(db, "trips"), where("driverEmail", "==", email), where("type", "==", "adda"));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedPosts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // LIVE GPS BROADCASTING
  const startTracking = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          posts.forEach(async (post) => {
            await updateDoc(doc(db, "trips", post.id), {
              liveLat: latitude,
              liveLng: longitude,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Make sure location permissions are enabled!");
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setIsTracking(false);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle schedule?")) return;
    try {
      await deleteDoc(doc(db, "trips", postId));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      alert("Failed to delete post.");
    }
  };

  if (loading) return <div className="text-center py-16">Loading your posts...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-xl text-green-700">
          <Bus size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Terminal Posts</h1>
          <p className="text-gray-500">Manage your active vehicle schedules & live tracking</p>
        </div>
      </div>

      {/* LIVE LOCATION BROADCAST CONTROL */}
      <div className={`p-6 rounded-2xl shadow-sm border mb-8 transition-colors ${isTracking ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Navigation className={isTracking ? "text-green-600 animate-pulse" : "text-green-700"} size={26} />
          <h2 className="text-lg font-bold text-gray-900">Terminal Live GPS Broadcast</h2>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          {isTracking 
            ? "You are broadcasting your live location. Passengers can track your vehicles on the map!" 
            : "Turn this on when your fleet departs so passengers can track their ride live."}
        </p>
        
        {isTracking ? (
          <button onClick={stopTracking} className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
            <StopCircle size={20} /> Stop Broadcasting Location
          </button>
        ) : (
          <button onClick={startTracking} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2">
            <Navigation size={20} /> Start Broadcasting Location
          </button>
        )}
      </div>

      {/* POSTS LIST */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
            You haven't posted any vehicle schedules yet.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
              
              <button onClick={() => handleDelete(post.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                <Trash2 size={20} />
              </button>

              <div className="space-y-2 pr-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <Bus size={12} /> {post.vehicleType}
                  </span>
                  {post.vehicleIdentifier && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Hash size={12} /> {post.vehicleIdentifier}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-500 text-xs flex items-center gap-1"><Users size={12} /> {post.seatsAvailable} seats available</span>
                </div>

                <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {post.origin} <span className="text-gray-400">→</span> {post.destination}
                </div>

                {post.addaName && (
                  <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                    <Building2 size={14} /> {post.addaName}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-sm text-gray-500 border-t border-gray-100 mt-2">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.time}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {post.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Ticket Price:</span>
                <span className="text-lg font-black text-gray-900">Rs {post.price} <span className="text-xs font-normal text-gray-500">/ seat</span></span>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}