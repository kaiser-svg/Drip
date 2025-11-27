"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHydration } from "@/hooks/useHydration";
import { Droplets, Sparkles, Target, Bell, ChevronRight, Check, User, Zap, Activity } from "lucide-react";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "name", title: "Your Name" },
  { id: "activity", title: "Activity" },
  { id: "goal", title: "Your Goal" },
  { id: "complete", title: "Ready!" },
];

// Animated particle component
function FloatingParticle({ delay, duration, size, startX, startY }: { 
  delay: number; 
  duration: number; 
  size: number; 
  startX: number;
  startY: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)`,
      }}
      animate={{
        y: [-20, -100, -20],
        x: [0, Math.random() * 40 - 20, 0],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Dynamic wave background
function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400" />
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Mesh gradient effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(at 40% 20%, hsla(200, 100%, 74%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220, 100%, 60%, 1) 0px, transparent 50%)",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.3}
          duration={4 + Math.random() * 3}
          size={30 + Math.random() * 60}
          startX={Math.random() * 100}
          startY={60 + Math.random() * 40}
        />
      ))}
      
      {/* Wave layers */}
      <svg 
        className="absolute bottom-0 left-0 w-full" 
        viewBox="0 0 1440 320" 
        preserveAspectRatio="none"
        style={{ height: '30%' }}
      >
        <motion.path
          fill="rgba(255,255,255,0.1)"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,149.3C960,149,1056,203,1152,218.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="rgba(255,255,255,0.15)"
          d="M0,256L48,250.7C96,245,192,235,288,213.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,256L48,250.7C96,245,192,235,288,213.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,192C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,256L48,250.7C96,245,192,235,288,213.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
    </div>
  );
}

export function Onboarding() {
  const { settings, setSettings } = useHydration();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
  const [customGoal, setCustomGoal] = useState(2500);
  const [showContent, setShowContent] = useState(false);

  // Animate in after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate recommended goal based on activity
  const getRecommendedGoal = () => {
    if (activity === "low") return 2000;
    if (activity === "moderate") return 2500;
    return 3000;
  };

  useEffect(() => {
    setCustomGoal(getRecommendedGoal());
  }, [activity]);

  const handleComplete = () => {
    setSettings({
      ...settings,
      name,
      activityLevel: activity,
      dailyGoal: customGoal,
      hasOnboarded: true,
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const activityOptions = [
    { 
      value: "low", 
      label: "Relaxed", 
      description: "Mostly sitting, light movement",
      icon: <User className="w-6 h-6" />,
      goal: "2,000ml"
    },
    { 
      value: "moderate", 
      label: "Active", 
      description: "Regular exercise, on your feet",
      icon: <Activity className="w-6 h-6" />,
      goal: "2,500ml"
    },
    { 
      value: "high", 
      label: "Athletic", 
      description: "Intense workouts, sports",
      icon: <Zap className="w-6 h-6" />,
      goal: "3,000ml"
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic wave background */}
      <WaveBackground />

      {/* Content */}
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            {/* Progress indicator */}
            <div className="mb-6 flex justify-center gap-2">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step 
                      ? "w-8 bg-white" 
                      : i < step 
                      ? "w-2 bg-white/80" 
                      : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>

            {/* Card */}
            <motion.div 
              layout
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* STEP 0: Welcome */}
                {step === 0 && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 10, delay: 0.2 }}
                      className="relative mx-auto w-24 h-24 mb-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl rotate-6" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center">
                        <Droplets className="w-12 h-12 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2"
                      >
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </motion.div>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold text-zinc-900 dark:text-white mb-3"
                    >
                      Welcome to Drip
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-zinc-600 dark:text-zinc-400 mb-8"
                    >
                      Your journey to better hydration starts here. Let's set up your personalized experience.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={nextStep}
                        className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      >
                        Get Started
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 1: Name */}
                {step === 1 && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8"
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center"
                      >
                        <User className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        What's your name?
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        We'll use this to personalize your experience
                      </p>
                    </div>

                    <div className="space-y-6">
                      <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 text-lg rounded-2xl border-2 focus:border-blue-500 text-center"
                        autoFocus
                      />

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1 h-12 rounded-xl"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={nextStep}
                          disabled={!name.trim()}
                          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Activity */}
                {step === 2 && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center"
                      >
                        <Target className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        How active are you?
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This helps us recommend your daily goal
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {activityOptions.map((option, index) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setActivity(option.value as any)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                            activity === option.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              activity === option.value
                                ? "bg-blue-500 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                            }`}>
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-zinc-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {option.description}
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              activity === option.value 
                                ? "text-blue-600 dark:text-blue-400" 
                                : "text-zinc-400"
                            }`}>
                              {option.goal}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-12 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Goal */}
                {step === 3 && (
                  <motion.div
                    key="goal"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
                      >
                        <Bell className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        Your Daily Goal
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Adjust your target or keep our recommendation
                      </p>
                    </div>

                    <div className="mb-8">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 text-center"
                      >
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {customGoal}
                          <span className="text-2xl text-blue-400 dark:text-blue-500">ml</span>
                        </div>
                        <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                          Approximately {Math.round(customGoal / 250)} glasses per day
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-4">
                          <button
                            onClick={() => setCustomGoal(g => Math.max(1000, g - 250))}
                            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300 hover:scale-110 transition-transform active:scale-95"
                          >
                            -
                          </button>
                          <div className="w-24 h-1 bg-blue-200 dark:bg-blue-800 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${((customGoal - 1000) / 3000) * 100}%` }}
                            />
                          </div>
                          <button
                            onClick={() => setCustomGoal(g => Math.min(4000, g + 250))}
                            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300 hover:scale-110 transition-transform active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1 h-12 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Complete */}
                {step === 4 && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="relative mx-auto w-24 h-24 mb-6"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-300 dark:border-emerald-700"
                      />
                      <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        You're all set, {name}!
                      </h2>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Your goal is <span className="font-semibold text-blue-600 dark:text-blue-400">{customGoal}ml</span> per day.
                        Let's start hydrating!
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={handleComplete}
                        className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/30"
                      >
                        <Droplets className="w-5 h-5 mr-2" />
                        Start Tracking
                      </Button>
                      <button
                        onClick={prevStep}
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        Go back and adjust
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}