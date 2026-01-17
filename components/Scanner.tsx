
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Stethoscope, Microscope, BrainCircuit } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (file: string) => void;
  isProcessing: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onScanComplete(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full mb-6">
          <Stethoscope size={14} className="text-sky-400" />
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Medical Diagnostic Interface</span>
        </div>
        <h1 className="text-5xl font-light tracking-tight mb-4 text-white">
          <span className="font-bold text-sky-500">Pulmo</span>Sight <span className="text-slate-500">Clinical AI</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto font-medium text-sm leading-relaxed">
          Advanced radiographic analysis for automated pulmonary screening. 
          Upload clinical assets to initiate feature mapping and diagnostic synthesis.
        </p>
      </motion.div>

      <div
        className={`relative group rounded-[2.5rem] border transition-all duration-500 min-h-[400px] flex items-center justify-center overflow-hidden glass-card
          ${dragActive ? 'border-sky-400 bg-sky-500/5 ring-4 ring-sky-500/10' : 'border-white/10'}
          ${preview ? 'border-sky-500/30' : 'hover:border-sky-500/40'}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-6 cursor-pointer py-16"
            >
              <div className="w-20 h-20 rounded-3xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
                <Upload className="w-8 h-8 text-sky-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white tracking-tight">Select Radiological Asset</p>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">DICOM / PNG / JPEG / TIFF</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full flex items-center justify-center p-8 bg-slate-900/50"
            >
              <img src={preview} alt="Radiograph" className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white/5" />
              
              {isProcessing && (
                <>
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-sky-400/20 to-transparent z-10"
                    />
                  </div>

                  {/* Clinical Status Overlays */}
                  <div className="absolute top-8 left-8 p-5 rounded-2xl glass-card border-white/10 space-y-3 min-w-[240px]">
                    <div className="flex items-center gap-2 text-sky-400 mb-1">
                      <Microscope size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Active Analysis</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase"><span>Feature Mapping</span> <span className="text-sky-400">Processing</span></div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div className="bg-sky-400 h-full" animate={{ width: ["10%", "85%", "40%", "95%"] }} transition={{ duration: 4, repeat: Infinity }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase pt-2 border-t border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Protocol: IEEE-Med-X
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-8 p-4 rounded-xl glass-card border-white/10 flex items-center gap-3">
                    <BrainCircuit size={18} className="text-sky-400" />
                    <div>
                      <p className="text-[10px] text-white font-bold uppercase tracking-tighter">Diagnostic Core Online</p>
                      <p className="text-[8px] text-slate-500 mono uppercase tracking-widest">Model: PulmoNet-v4</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scanner;
