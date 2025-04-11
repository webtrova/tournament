"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";import HeroSection from "@/components/HeroSection";

const Home = () => {
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
            <section
                className="relative h-[90vh] overflow-hidden"            
            >
                <div className="absolute inset-0 bg-black opacity-50" /> {/* Semi-transparent black overlay */}
                <HeroSection mounted={mounted} session={session} />
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
};
export default Home;
