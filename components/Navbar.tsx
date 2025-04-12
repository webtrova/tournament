
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Unsubscribe on component unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
      <nav className="bg-white py-4 px-6" style={{ zIndex: 50 }}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo Placeholder */}
          <div className="text-xl font-bold">
            <Link href="/">
              <Image
                  src="/BDC_logo.svg"
                  alt="Bergenfield Dominoes Tournament Logo"
                  width={90} // Adjust width as needed
                  height={50} // Adjust height as needed
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
              {user === null ? (
                  <>
                      <Link href="/login" className="hover:text-blue-500">
                          Login
                      </Link>
                      <Link href="/register" className="hover:text-blue-500">Register</Link>
                  </>
              ) : (
                  <Link href="/dashboard" className="hover:text-blue-500 text-white">
                      Dashboard
                  </Link>
              )}
            {user !== null && (
              <button onClick={handleLogout} className="hover:text-blue-500">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
  );
};

export default Navbar;