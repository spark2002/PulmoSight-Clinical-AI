
import React, { useState, useMemo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { 
  Download, 
  MessageSquare, 
  Stethoscope, 
  User, 
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Clock,
  Search,
  ClipboardCheck,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react';
import CircularProgress from './CircularProgress';
import Typewriter from './Typewriter';
import { ScanResult } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DiagnosticCockpitProps {
  result: ScanResult;
  image: string;
  onOpenChat: () => void;
  onReset: () => void;
}

const MOCK_HISTORY: ScanResult[] = [
  { patientId: "PX-8821-B", diagnosis: "Pneumonia", confidence: 94.2, findings: ["Lower lobe consolidation"], reportText: "Pneumonia profile detected.", timestamp: "2024-03-10T14:22:00Z" },
  { patientId: "PX-7710-A", diagnosis: "Normal", confidence: 99.8, findings: ["Clear lung fields"], reportText: "Clear radiographic profile.", timestamp: "2024-03-08T09:15:00Z" },
  { patientId: "PX-9902-C", diagnosis: "Tuberculosis", confidence: 88.5, findings: ["Upper lobe cavitation"], reportText: "Tuberculosis indicators observed.", timestamp: "2024-03-05T16:45:00Z" },
  { patientId: "PX-1234-X", diagnosis: "Normal", confidence: 98.1, findings: ["Healthy lung expansion"], reportText: "Standard thoracic profile.", timestamp: "2024-02-28T11:30:00Z" },
  { patientId: "PX-4567-Y", diagnosis: "Pneumonia", confidence: 91.4, findings: ["Infiltration in right middle lobe"], reportText: "Early-stage pneumonia signs.", timestamp: "2024-02-15T13:10:00Z" }
];

const DiagnosticCockpit: React.FC<DiagnosticCockpitProps> = ({ result, image, onOpenChat, onReset }) => {
  const isCritical = result.diagnosis !== 'Normal';
  const primaryColor = isCritical ? '#f43f5e' : '#0ea5e9';
  
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [diagFilter, setDiagFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('All Time');

  const downloadReport = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: '#0f172a', scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Clinical_Report_${result.patientId}.pdf`);
  };

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchesSearch = item.patientId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDiag = diagFilter === 'All' || item.diagnosis === diagFilter;
      
      let matchesDate = true;
      const itemDate = new Date(item.timestamp);
      const now = new Date();
      
      if (dateFilter === 'Last 7 Days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = itemDate >= sevenDaysAgo;
      } else if (dateFilter === 'Last 30 Days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = itemDate >= thirtyDaysAgo;
      }
      
      return matchesSearch && matchesDiag && matchesDate;
    });
  }, [diagFilter, searchTerm, dateFilter]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-6 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
            <Stethoscope className="text-sky-400" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Radiological Workstation</h2>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clinical Data Sync: Optimized</span>
              <span>|</span>
              <span>Ref ID: DCC-X1</span>
            </div>
          </div>
        </div>
        <button onClick={onReset} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
          New Case Analysis
        </button>
      </div>

      <div id="report-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Asset Viewer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-card space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User size={14} /> Case Identifier
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Patient ID</p>
                <p className="text-white font-semibold text-lg">{result.patientId}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Analysis Date</p>
                <p className="text-white font-semibold text-lg">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div 
              animate={{
                borderColor: [ 
                  `${primaryColor}30`, 
                  isCritical ? `${primaryColor}ff` : `${primaryColor}80`, 
                  `${primaryColor}30` 
                ],
                boxShadow: isCritical 
                  ? [
                      `0 0 10px ${primaryColor}20`, 
                      `0 0 60px ${primaryColor}60`, 
                      `0 0 10px ${primaryColor}20`
                    ]
                  : [
                      `0 0 5px ${primaryColor}10`, 
                      `0 0 20px ${primaryColor}30`, 
                      `0 0 5px ${primaryColor}10`
                    ],
                borderWidth: isCritical ? ['1px', '3px', '1px'] : ['1px', '2px', '1px']
              }}
              transition={{ 
                duration: isCritical ? 1.8 : 3.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative rounded-[2rem] overflow-hidden border bg-slate-900/80 h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing group shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                {[
                  { icon: ZoomIn, fn: () => setScale(s => Math.min(s+0.5, 4)) },
                  { icon: ZoomOut, fn: () => setScale(s => Math.max(s-0.5, 1)) },
                  { icon: Maximize2, fn: () => { setScale(1); x.set(0); y.set(0); } }
                ].map((btn, i) => (
                  <button key={i} onClick={btn.fn} className="p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:border-sky-500/50 transition-all">
                    <btn.icon size={18} />
                  </button>
                ))}
              </div>

              <motion.img 
                src={image} 
                drag={scale > 1}
                dragConstraints={{ left: -300 * scale, right: 300 * scale, top: -300 * scale, bottom: 300 * scale }}
                style={{ scale, x, y }}
                className="w-full h-full object-contain brightness-95 contrast-[1.05]" 
              />
              
              <div className="absolute bottom-6 left-6 z-20 flex gap-2">
                <span className="px-3 py-1.5 bg-slate-900/90 rounded-lg border border-white/10 text-[10px] font-bold text-sky-400 uppercase">Magnification: {scale.toFixed(1)}x</span>
              </div>
            </motion.div>

            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = image;
                link.download = `IMG_${result.patientId}.png`;
                link.click();
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <ImageIcon size={16} /> Save Radiograph Export
            </button>
          </div>
        </div>

        {/* Right: Diagnostic Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl glass-card flex flex-col items-center justify-center">
              <CircularProgress percentage={result.confidence} color={primaryColor} size={180} />
            </div>

            <div className="p-8 rounded-3xl glass-card relative overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <ClipboardCheck size={14} /> Diagnostic Findings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${isCritical ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)]'}`} />
                  <div>
                    <span className="text-3xl font-bold text-white tracking-tight uppercase">{result.diagnosis}</span>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Primary Indication</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/5">
                  {result.findings.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400/50" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-3xl glass-card min-h-[300px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <FileText size={14} /> Formal Medical Report
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-950/40 p-6 rounded-2xl border border-white/5">
              <Typewriter text={result.reportText} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button onClick={downloadReport} className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-sky-600 text-white font-bold hover:bg-sky-500 transition-all shadow-lg hover:shadow-sky-500/20 uppercase tracking-tight">
              <Download size={20} /> Export Clinical PDF
            </button>
            <button onClick={onOpenChat} className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all uppercase tracking-tight">
              <MessageSquare size={20} /> Professional Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Database View / Case Archive */}
      <section className="pt-10">
        <div className="p-8 rounded-3xl glass-card space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                <Clock />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Case Archive</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Historical Records & Filters</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Filter */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5">
                <Calendar size={14} className="ml-2 text-slate-500" />
                {['All Time', 'Last 7 Days', 'Last 30 Days'].map((t) => (
                  <button key={t} onClick={() => setDateFilter(t)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${dateFilter === t ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Diagnosis Filter */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5">
                <Filter size={14} className="ml-2 text-slate-500" />
                {['All', 'Normal', 'Tuberculosis', 'Pneumonia'].map((t) => (
                  <button key={t} onClick={() => setDiagFilter(t)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${diagFilter === t ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH BY ID..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:border-sky-500/50 w-56 placeholder:text-slate-600" 
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5 font-bold">
                  <th className="pb-4 px-4">Asset ID</th>
                  <th className="pb-4 px-4">Primary Indication</th>
                  <th className="pb-4 px-4 text-right">Confidence</th>
                  <th className="pb-4 px-4 text-right">Logged Date</th>
                  <th className="pb-4 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                  <tr key={item.patientId} className="group hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="py-5 px-4 text-sm font-semibold text-white mono">{item.patientId}</td>
                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase ${item.diagnosis === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.diagnosis === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {item.diagnosis}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right text-sm font-bold text-slate-400">{item.confidence.toFixed(1)}%</td>
                    <td className="py-5 px-4 text-right text-slate-500 text-[10px] font-bold uppercase tracking-tighter">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="py-5 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="inline-block text-sky-400" size={16} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-500 text-sm font-medium">
                      No matching records found in clinical database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiagnosticCockpit;
