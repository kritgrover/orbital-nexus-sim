import { Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { GroundStation } from "@/types/groundStation";

interface GlobeViewProps {
  stations: GroundStation[];
  activeStationId: string;
  onHandoff?: (fromStation: string, toStation: string) => void;
}

const GlobeView = ({ stations, activeStationId, onHandoff }: GlobeViewProps) => {
  const [issInCone, setIssInCone] = useState(false);
  const [handoffInProgress, setHandoffInProgress] = useState(false);
  const [prevActiveStation, setPrevActiveStation] = useState(activeStationId);

  // Detect handoff when active station changes
  useEffect(() => {
    if (activeStationId !== prevActiveStation) {
      setHandoffInProgress(true);
      onHandoff?.(prevActiveStation, activeStationId);
      
      setTimeout(() => {
        setHandoffInProgress(false);
        setPrevActiveStation(activeStationId);
      }, 1500);
    }
  }, [activeStationId, prevActiveStation, onHandoff]);

  // Simulate ISS entering/leaving cone
  const toggleCone = () => {
    setIssInCone(!issInCone);
  };

  const activeStation = stations.find(s => s.id === activeStationId);
  const inactiveStations = stations.filter(s => s.id !== activeStationId);

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

          {/* Active Ground Station with Cone */}
          {activeStation && (
            <>
              <div 
                className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full z-20 cursor-pointer animate-pulse"
                onClick={toggleCone}
                title={`${activeStation.name} Ground Station (Active)`}
                style={{
                  backgroundColor: activeStation.color,
                  border: `2px solid ${activeStation.color}`,
                  boxShadow: `0 0 10px ${activeStation.color}`
                }}
              />

              {/* Coverage Cone for Active Station */}
              <div 
                className={`absolute bottom-1/3 left-1/3 -translate-x-1/2 pointer-events-none transition-all duration-500`}
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '80px solid transparent',
                  borderRight: '80px solid transparent',
                  borderBottom: issInCone 
                    ? `160px solid ${activeStation.color}40` 
                    : `160px solid ${activeStation.color}30`,
                  transformOrigin: 'bottom center',
                  transform: 'translateX(-50%) translateY(-100%) rotate(180deg)',
                  filter: 'blur(1px)',
                }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background: `linear-gradient(180deg, ${activeStation.color}50 0%, ${activeStation.color}15 100%)`,
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
                  stroke={activeStation.color} 
                  strokeWidth="1" 
                  opacity="0.4"
                  strokeDasharray="4,4"
                />
                <line 
                  x1="80" 
                  y1="160" 
                  x2="160" 
                  y2="0" 
                  stroke={activeStation.color} 
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
                  stroke={activeStation.color}
                  strokeWidth="1"
                  opacity="0.3"
                />
              </svg>

              {/* Connection line from ISS to active station */}
              {issInCone && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="50%"
                    y1="25%"
                    x2="33%"
                    y2="66%"
                    stroke={activeStation.color}
                    strokeWidth="2"
                    opacity="0.6"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </>
          )}

          {/* Inactive Ground Stations */}
          {inactiveStations.map((station, index) => {
            const positions = [
              { bottom: '40%', left: '60%' },
              { bottom: '50%', left: '20%' },
            ];
            const pos = positions[index] || positions[0];

            return (
              <div key={station.id}>
                <div 
                  className="absolute w-3 h-3 rounded-full z-20 opacity-50"
                  style={{
                    ...pos,
                    backgroundColor: station.color,
                    border: `2px solid ${station.color}`,
                  }}
                  title={`${station.name} Ground Station (Idle)`}
                />
                
                {/* Inactive station cone */}
                <div 
                  className="absolute -translate-x-1/2 pointer-events-none opacity-20"
                  style={{
                    ...pos,
                    width: 0,
                    height: 0,
                    borderLeft: '60px solid transparent',
                    borderRight: '60px solid transparent',
                    borderBottom: `120px solid ${station.color}20`,
                    transformOrigin: 'bottom center',
                    transform: 'translateX(-50%) translateY(-100%) rotate(180deg)',
                    filter: 'blur(2px)',
                  }}
                />
              </div>
            );
          })}

          {/* ISS orbital path indicator */}
          <div 
            className={`absolute top-1/4 left-1/2 w-2 h-2 rounded-full z-20 transition-all duration-300 animate-pulse`}
            style={{
              backgroundColor: activeStation?.color || '#00d4ff'
            }}
          />

          {/* Link status indicator */}
          {issInCone && activeStation && (
            <div className="absolute top-4 right-4 z-20">
              <div 
                className="flex items-center gap-2 rounded px-2 py-1 border"
                style={{
                  backgroundColor: `${activeStation.color}20`,
                  borderColor: `${activeStation.color}80`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: activeStation.color }}
                />
                <span className="text-xs font-mono" style={{ color: activeStation.color }}>
                  LINK: {activeStation.name.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Handoff indicator */}
          {handoffInProgress && (
            <div className="absolute top-16 right-4 z-20">
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 rounded px-2 py-1 animate-pulse">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-xs font-mono text-amber-500">HANDOFF IN PROGRESS</span>
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
