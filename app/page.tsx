"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { motion } from "framer-motion";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  }, []);


  if (!mounted) return null;

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[90vh] overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-blue/30 animate-gradient-slow">
            {/* SVG Animation Placeholder */}
            {/* Replace this with your actual SVG animation code */}
            {/* You can adjust the positioning and styling using CSS classes or inline styles */}
            {/* Example: */}
            {/* <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> */}
            {/*   <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1" /> */}
            {/* </svg> */}
            {/* To use an external SVG, you might need to adjust your build process */}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-6xl font-bold mb-6 text-white">
                Bergenfield Dominoes Tournament
              </h1>
              <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                Join the ultimate 64-player showdown and become part of Bergen
                County's premier dominoes competition
              </p>
              {""}
              <motion.div
                className="flex gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {mounted && (
                  <>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={session ? "/dashboard" : "/(auth)/login"}
                      className="bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {session ? "Go to Dashboard" : "Login"}
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={session ? "/dashboard" : "/(auth)/register"}
                      className="bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {session ? "Go to Dashboard" : "Register"}
                    </motion.a>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100"
              >
                <h3 className="text-2xl font-semibold text-brand-blue mb-4">
                  Tournament Features
                </h3>
                <ul className="space-y-3">
                  {[
                    "64-player bracket management",
                    "Real-time match updates",
                    "QR code entry validation",
                    "Live tournament standings"
                  ].map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <span className="w-2 h-2 rounded-full bg-brand-blue" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100"
              >
                <h3 className="text-2xl font-semibold text-brand-red mb-4">
                  Getting Started
                </h3>
                <ul className="space-y-3">
                  {[
                    "Register or login to your account",
                    "View the tournament bracket",
                    "Check match schedules",
                    "Track your progress"
                  ].map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <span className="w-2 h-2 rounded-full bg-brand-red" />
                      <span>{step}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {session && (
          <section className="py-12 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Current Tournaments
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  { id: 1, name: "Summer Showdown" },
                  { id: 2, name: "Fall Face-Off" }
                ].map((tournament) => (
                  <motion.a
                    key={tournament.id}
                    href={`/tournament/${tournament.id}`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                    }}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <h3 className="text-xl font-semibold text-gray-700">
                      {tournament.name}
                    </h3>
                    <p className="text-gray-500 mt-2">View Tournament</p>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </div>
  );
}
