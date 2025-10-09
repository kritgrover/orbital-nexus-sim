import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const LinkStatus = () => {
  const [dopplerShift, setDopplerShift] = useState(2.34);

  // Simulate Doppler shift changes
  useEffect(() => {
    const interval = setInterval(() => {
      setDopplerShift(prev => {
        const change = (Math.random() - 0.5) * 0.5;
        return Math.max(-10, Math.min(10, prev + change));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const isApproaching = dopplerShift > 0;
  const dopplerPercent = ((dopplerShift + 10) / 20) * 100;

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-secondary mb-3">
        LINK STATUS
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-secondary">Signal Strength</span>
          <span className="font-mono">-87 dBm</span>
        </div>
        <Progress value={72} className="h-1.5" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <div className="text-xs text-secondary mb-1">Connection</div>
          <div className="text-xs font-mono text-success">ACQUIRED</div>
        </div>
        <div>
          <div className="text-xs text-secondary mb-1">Latency</div>
          <div className="text-xs font-mono text-right">142.8 ms</div>
        </div>
      </div>

      <div className="pt-2">
        <div className="text-xs text-secondary mb-1">Doppler Shift</div>
        <div className="text-xs font-mono mb-2">
          {dopplerShift > 0 ? '+' : ''}{dopplerShift.toFixed(2)} kHz
        </div>

        {/* Doppler Frequency Spectrum Visualization */}
        <div className="relative h-12 bg-background/50 rounded border border-border overflow-hidden">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(100,116,139,0.1) 50%, rgba(0,212,255,0.3) 100%)'
            }}
          />

          {/* Scale markings */}
          <div className="absolute inset-0 flex justify-between items-center px-2 text-[9px] text-secondary/60 font-mono">
            <span>-10</span>
            <span>-5</span>
            <span className="text-secondary">0 Hz</span>
            <span>+5</span>
            <span>+10</span>
          </div>

          {/* Center line (0 Hz reference) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-secondary/30" />

          {/* Doppler indicator bar */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-8 w-1 rounded-full transition-all duration-300 shadow-lg"
            style={{
              left: `${dopplerPercent}%`,
              backgroundColor: isApproaching ? '#00d4ff' : '#fbbf24',
              boxShadow: `0 0 10px ${isApproaching ? '#00d4ff' : '#fbbf24'}`,
            }}
          >
            {/* Indicator glow */}
            <div 
              className="absolute inset-0 rounded-full blur-sm animate-pulse"
              style={{
                backgroundColor: isApproaching ? '#00d4ff' : '#fbbf24',
              }}
            />
          </div>

          {/* Waveform pattern behind indicator */}
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
            <path
              d={`M 0,24 ${Array.from({ length: 50 }, (_, i) => {
                const x = (i / 49) * 100;
                const freq = 0.2 + Math.abs(50 - x) * 0.02;
                const y = 24 + Math.sin(i * freq) * 8;
                return `L ${x},${y}`;
              }).join(' ')}`}
              fill="none"
              stroke={isApproaching ? '#00d4ff' : '#fbbf24'}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Direction indicator */}
        <div className="flex justify-center mt-1">
          <span className={`text-[9px] font-mono ${isApproaching ? 'text-[#00d4ff]' : 'text-[#fbbf24]'}`}>
            {isApproaching ? '← APPROACHING' : 'RECEDING →'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default LinkStatus;
