
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import DiagnosticCockpit from './components/DiagnosticCockpit';
import Chatbot from './components/Chatbot';
import { analyzeXRay } from './services/geminiService';
import { AppState, ScanResult } from './types';
import { ShieldCheck, Database, Server, Wifi, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleScan = async (image: string) => {
    setCurrentImage(image);
    setAppState(AppState.SCANNING);
    
    try {
      const result = await analyzeXRay(image);
      setScanResult(result);
      setAppState(AppState.REPORT);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAppState(AppState.IDLE);
      alert("Diagnostic interface interrupted. Please check network integrity.");
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setScanResult(null);
    setIsChatOpen(false);
  };

  return (
    <div className="relative min-h-screen text-slate-200 flex flex-col">
      {/* Fixed Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card !rounded-none border-t-0 border-x-0 bg-slate-900/80 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] tracking-widest uppercase">
              <ShieldCheck size={12} /> HIPAA COMPLIANT
            </div>
            <div className="text-slate-500 text-[9px] mono uppercase">Interface Status: Active</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 justify-end text-emerald-400 font-bold text-[10px] tracking-widest uppercase">
              SECURE LINK <Wifi size={12} />
            </div>
            <div className="text-slate-500 text-[9px] mono uppercase">Latency: 24ms</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pt-16 pb-20">
        <AnimatePresence mode="wait">
          {appState === AppState.IDLE || appState === AppState.SCANNING ? (
            <motion.div
              key="scanner-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-144px)]"
            >
              <Scanner onScanComplete={handleScan} isProcessing={appState === AppState.SCANNING} />
            </motion.div>
          ) : (
            <motion.div
              key="report-view"
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen"
            >
              <DiagnosticCockpit 
                result={scanResult!} 
                image={currentImage!} 
                onOpenChat={() => setIsChatOpen(true)}
                onReset={resetApp}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Footer Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 glass-card !rounded-none border-b-0 border-x-0 bg-slate-900/90 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-medium uppercase tracking-wider">
          <Server size={12} className="text-sky-400" />
          <span>Clinical Workstation <span className="text-slate-600 font-mono">#DCC-001</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-sky-500" />
            <span>AI CORE 11.2</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>© 2024 PulmoSight AI</span>
        </div>
      </footer>

      {scanResult && (
        <Chatbot 
          reportContext={scanResult.reportText} 
          isOpen={isChatOpen} 
          setIsOpen={setIsChatOpen} 
        />
      )}
    </div>
  );
};

export default App;
