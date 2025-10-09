import { Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const GlobeView = () => {
  const [issInCone, setIssInCone] = useState(false);

  // Simulate ISS entering/leaving cone
  const toggleCone = () => {
    setIssInCone(!issInCone);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-secondary">
          ORBITAL TRACKING
        </h2>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Placeholder for 3D Globe - Will be enhanced later */}
        <div className="w-full aspect-square max-w-md border-2 border-muted rounded-full relative bg-panel/50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center relative z-10">
              <div className="text-6xl mb-2">🌍</div>
              <div className="text-xs font-mono text-secondary">ISS ORBITAL PATH</div>
              <div className="mt-4 text-xs font-mono">
                <div>LAT: 45.2°N</div>
                <div>LON: 79.4°W</div>
              </div>
            </div>
          </div>

          {/* Ground station marker (Toronto) */}
          <div 
            className="absolute bottom-1/3 left-1/3 w-3 h-3 border-2 border-success rounded-full z-20 cursor-pointer"
            onClick={toggleCone}
            title="Toronto Ground Station"
          />

          {/* Coverage Cone */}
          <div 
            className={`absolute bottom-1/3 left-1/3 -translate-x-1/2 pointer-events-none transition-all duration-500`}
            style={{
              width: 0,
              height: 0,
              borderLeft: '80px solid transparent',
              borderRight: '80px solid transparent',
              borderBottom: issInCone 
                ? '160px solid rgba(74, 222, 128, 0.25)' 
                : '160px solid rgba(0, 212, 255, 0.18)',
              transformOrigin: 'bottom center',
              transform: 'translateX(-50%) translateY(-100%) rotate(180deg)',
              filter: 'blur(1px)',
            }}
          >
            {/* Wireframe edges */}
            <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: issInCone
                  ? 'linear-gradient(180deg, rgba(74, 222, 128, 0.3) 0%, rgba(74, 222, 128, 0.1) 100%)'
                  : 'linear-gradient(180deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)',
              }}
            />
          </div>

          {/* Cone edge lines (wireframe effect) */}
          <svg 
            className="absolute bottom-1/3 left-1/3 pointer-events-none" 
            width="160" 
            height="160" 
            style={{ transform: 'translate(-50%, -100%)' }}
          >
            <line 
              x1="80" 
              y1="160" 
              x2="0" 
              y2="0" 
              stroke={issInCone ? '#4ade80' : '#00d4ff'} 
              strokeWidth="1" 
              opacity="0.4"
              strokeDasharray="4,4"
            />
            <line 
              x1="80" 
              y1="160" 
              x2="160" 
              y2="0" 
              stroke={issInCone ? '#4ade80' : '#00d4ff'} 
              strokeWidth="1" 
              opacity="0.4"
              strokeDasharray="4,4"
            />
            <ellipse
              cx="80"
              cy="0"
              rx="80"
              ry="20"
              fill="none"
              stroke={issInCone ? '#4ade80' : '#00d4ff'}
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>

          {/* ISS orbital path indicator */}
          <div 
            className={`absolute top-1/4 left-1/2 w-2 h-2 rounded-full z-20 transition-all duration-300 ${
              issInCone ? 'bg-success animate-pulse' : 'bg-primary animate-pulse'
            }`}
          />

          {/* Link status indicator */}
          {issInCone && (
            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center gap-2 bg-success/20 border border-success/50 rounded px-2 py-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs font-mono text-success">LINK ACQUIRED</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Play className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Pause className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-secondary">
          <Clock className="h-3 w-3" />
          <span>UTC: 2025-10-09 14:32:18</span>
        </div>
      </div>
    </div>
  );
};

export default GlobeView;
