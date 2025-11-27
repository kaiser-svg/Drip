"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if user hasn't dismissed it before
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show custom prompt after delay
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-black/20 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Install Drip</h3>
                    <p className="text-xs text-white/80">Add to your home screen</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {isIOS ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Install Drip for quick access and offline use:
                  </p>
                  <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                      <span>Tap the <strong>Share</strong> button in Safari</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
                      <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
                      <span>Tap <strong>Add</strong> to confirm</span>
                    </li>
                  </ol>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Got it
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Get the full app experience with quick access from your home screen, offline support, and native feel.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstall}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                    >
                      Later
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
