"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const HeroSection: React.FC = () => {
  return (
    <section
      className="absolute top-0 left-0 right-0 h-[100vh] overflow-hidden z-0 pt-[100px]"
      style={{
        backgroundImage: "url('/hero1.jpg')", // Use hero1.jpg as the background
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-black opacity-50" // Semi-transparent overlay
      />









      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 text-white text-shadow">
            Bergenfield Dominoes Tournament
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto text-shadow">
            Join the ultimate 64-player showdown and become part of Bergen
            County's premier dominoes competition
          </p>

          <motion.div
            className="flex gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};







export default HeroSection;