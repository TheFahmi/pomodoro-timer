"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ZenModeProps {
  remainingTime: number;
  totalTime: number;
  onToggleZenMode?: () => void; // Optional callback for parent components
}

type AnimationType = 'breathing' | 'waves' | 'particles' | 'gradient';

export default function ZenMode({
  remainingTime,
  totalTime,
  onToggleZenMode
}: ZenModeProps) {
  const [animationType, setAnimationType] = useState<AnimationType>('breathing');
  const [showZenSettings, setShowZenSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Setup canvas for particle animation
  useEffect(() => {
    if (animationType === 'particles' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas dimensions
      const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      // Particle class
      class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;

        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 5 + 1;
          this.speedX = Math.random() * 3 - 1.5;
          this.speedY = Math.random() * 3 - 1.5;
          this.color = `hsla(${Math.random() * 60 + 200}, 100%, 70%, 0.8)`;
        }

        update() {
          this.x += this.speedX;
          this.y += this.speedY;

          if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
          if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
          if (!ctx) return;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Create particles
      const particles: Particle[] = [];
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      // Animation loop
      const animate = () => {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });

        // Connect particles with lines if they're close enough
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [animationType]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, (remainingTime / totalTime) * 100));

  // Render breathing animation
  const renderBreathingAnimation = () => {
    // Calculate breathing phase based on remaining time
    // Complete breath cycle every 10 seconds (5s inhale, 5s exhale)
    const breathCycleTime = 10;
    const breathPhase = (Math.floor(remainingTime / breathCycleTime) % 2 === 0)
      ? (remainingTime % breathCycleTime) / breathCycleTime // Inhale
      : 1 - (remainingTime % breathCycleTime) / breathCycleTime; // Exhale

    const scale = 0.8 + breathPhase * 0.4; // Scale between 0.8 and 1.2

    return (
      <div className="flex items-center justify-center h-full w-full">
        {/* Main breathing circle with synchronized text */}
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          {/* Breathing instruction text */}
          <motion.div
            className="absolute -top-16 text-white text-xl font-bold text-center z-50 px-4 py-1 rounded-full"
            style={{
              textShadow: "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5)",
              letterSpacing: "1px",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              border: "2px solid rgba(255, 255, 255, 0.2)"
            }}
            animate={{
              opacity: [0.9, 1, 0.9],
              scale: breathPhase < 0.5 ? [1, 1.05, 1] : [1.05, 1, 1.05],
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity
            }}
          >
            {breathPhase < 0.5 ? "Breathe in..." : "Breathe out..."}
          </motion.div>

          {/* Main breathing circle */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/50 to-indigo-500/50 flex items-center justify-center"
            animate={{
              scale: scale,
              boxShadow: breathPhase < 0.5
                ? `0 0 ${20 + breathPhase * 40}px ${5 + breathPhase * 15}px rgba(147, 197, 253, 0.3)`
                : `0 0 ${60 - (breathPhase - 0.5) * 40}px ${20 - (breathPhase - 0.5) * 15}px rgba(147, 197, 253, 0.3)`
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {/* Inner circle */}
            <motion.div
              className="w-3/4 h-3/4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
              animate={{
                scale: 1 - (scale - 1) * 0.5
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {/* Visual indicator for breathing rhythm */}
              <motion.div
                className="w-1/2 h-1/2 rounded-full bg-white/20 flex items-center justify-center"
                animate={{
                  scale: breathPhase < 0.5 ? [0.8, 1.2, 0.8] : [1.2, 0.8, 1.2],
                }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  };

  // Render wave animation
  const renderWavesAnimation = () => {
    return (
      <div className="absolute inset-0 overflow-hidden bg-blue-900">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 right-0 bg-blue-500 opacity-30"
            style={{
              height: `${i * 20}vh`,
              zIndex: 1,
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0]
            }}
            transition={{
              duration: 3 + i * 0.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Add some floating bubbles */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white opacity-60"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              zIndex: 2
            }}
            animate={{
              y: [0, -window.innerHeight - 50],
              x: [0, (Math.random() - 0.5) * 100]
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: Math.random() * 5,
              delay: i * 2
            }}
          />
        ))}
      </div>
    );
  };

  // Render particle animation
  const renderParticlesAnimation = () => {
    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    );
  };

  // Render gradient animation
  const renderGradientAnimation = () => {
    return (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
        animate={{
          background: [
            "linear-gradient(to right, #3b82f6, #8b5cf6)",
            "linear-gradient(to right, #8b5cf6, #ec4899)",
            "linear-gradient(to right, #ec4899, #06b6d4)",
            "linear-gradient(to right, #06b6d4, #3b82f6)",
          ],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background animation based on selected type */}
      <div className="absolute inset-0 bg-black">
        {animationType === 'waves' && renderWavesAnimation()}
        {animationType === 'particles' && renderParticlesAnimation()}
        {animationType === 'gradient' && renderGradientAnimation()}
      </div>

      {/* Timer display */}
      <div className="relative z-10 text-center">
        {/* Progress circle with timer inside */}
        <div className="w-80 h-80 relative mx-auto">
          {/* Breathing animation overlay when breathing mode is active */}
          {animationType === 'breathing' && (
            <div className="absolute inset-0 z-0">
              {renderBreathingAnimation()}
            </div>
          )}
          <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
            {/* Outer glow */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="3"
            />

            {/* Secondary progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              filter="url(#glow)"
            />

            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - progressPercentage / 100)}` }}
              transition={{ duration: 0.5 }}
              filter="url(#glow)"
            />

            {/* Small dots around the circle */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6) * Math.PI / 180;
              const x = 50 + 45 * Math.cos(angle);
              const y = 50 + 45 * Math.sin(angle);
              const isHour = i % 5 === 0;

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isHour ? 1 : 0.5}
                  fill="white"
                  opacity={isHour ? 0.8 : 0.4}
                />
              );
            })}
          </svg>

          {/* Timer text in the center */}
          <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
            <motion.div
              className="text-white text-7xl font-bold tracking-wider"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </motion.div>
            <motion.div
              className="text-white/70 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {animationType === 'breathing' ? 'Breathe with the circle' :
               animationType === 'waves' ? 'Flow with the waves' :
               animationType === 'particles' ? 'Float with the particles' :
               'Relax your mind'}
            </motion.div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center mt-10 space-x-4">
          <Link href="/">
            <motion.button
              onClick={() => onToggleZenMode && onToggleZenMode()}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Exit Zen Mode
            </motion.button>
          </Link>

          <motion.button
            onClick={() => setShowZenSettings(!showZenSettings)}
            className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </div>

        {/* Zen Settings Panel */}
        <AnimatePresence>
          {showZenSettings && (
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-black/70 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl z-[100]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-medium">Zen Mode Settings</h3>
                <button
                  onClick={() => setShowZenSettings(false)}
                  className="text-white/70 hover:text-white cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/80 text-sm mb-3">Animation Type</p>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="radio"
                        id="zen-breathing"
                        name="zenAnimationType"
                        value="breathing"
                        checked={animationType === 'breathing'}
                        onChange={() => setAnimationType('breathing')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-white/90">
                        Breathing Guide
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="radio"
                        id="zen-waves"
                        name="zenAnimationType"
                        value="waves"
                        checked={animationType === 'waves'}
                        onChange={() => setAnimationType('waves')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-white/90">
                        Ocean Waves
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="radio"
                        id="zen-particles"
                        name="zenAnimationType"
                        value="particles"
                        checked={animationType === 'particles'}
                        onChange={() => setAnimationType('particles')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-white/90">
                        Floating Particles
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="radio"
                        id="zen-gradient"
                        name="zenAnimationType"
                        value="gradient"
                        checked={animationType === 'gradient'}
                        onChange={() => setAnimationType('gradient')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-white/90">
                        Flowing Gradient
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowZenSettings(false)}
                    className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
