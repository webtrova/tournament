"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const HeroSection: React.FC = () => {
  const images = ["/hero1.png", "/hero2.png", "/hero3.png"];
  const [currentImage, setCurrentImage] = useState(images[0]); // Initialize with the path to hero1.png

  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle through image paths
      setCurrentImage(images[(images.indexOf(currentImage) + 1) % images.length]); 
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImage, images]); // Include images in the dependency array

  return (
    <section className="relative h-[90vh] overflow-hidden">
      <div
        className="absolute inset-0"
        // Use currentImage state value (which now holds the path) directly
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
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