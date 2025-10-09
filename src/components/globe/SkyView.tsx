import { useEffect, useState } from "react";

interface SkyViewProps {
  azimuth?: number;
  elevation?: number;
  isVisible?: boolean;
}

const SkyView = ({ 
  azimuth = 127.8, 
  elevation = 42.3, 
  isVisible = true 
}: SkyViewProps) => {
  const [trail, setTrail] = useState<Array<{ az: number; el: number }>>([]);
  const centerX = 150;
  const centerY = 150;
  const radius = 130;

  // Simulate ISS movement for trail
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => {
        const newTrail = [...prev, { az: azimuth, el: elevation }];
        // Keep only last 10 points
        return newTrail.slice(-10);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [azimuth, elevation]);

  // Convert polar coordinates (azimuth, elevation) to cartesian (x, y)
  const polarToCartesian = (az: number, el: number) => {
    // Elevation: 90° (zenith) = center, 0° (horizon) = edge
    const normalizedEl = Math.max(0, el);
    const radiusAtEl = radius * (1 - normalizedEl / 90);
    const azRad = ((az - 90) * Math.PI) / 180; // Adjust so 0° is North (top)
    
    return {
      x: centerX + radiusAtEl * Math.cos(azRad),
      y: centerY + radiusAtEl * Math.sin(azRad)
    };
  };

  const issPos = polarToCartesian(azimuth, elevation);
  const direction = elevation > 45 ? "OVERHEAD" : elevation > 0 ? "RISING" : "SETTING";

  return (
    <div className="h-full flex flex-col border-t border-border">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-secondary">
          SKY VIEW - TORONTO
        </h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative" style={{ width: 300, height: 300 }}>
          <svg width="300" height="300" className="absolute inset-0">
            {/* Background */}
            <circle cx={centerX} cy={centerY} r={radius} fill="#242833" />

            {/* Elevation rings */}
            {[30, 60, 90].map((el, i) => {
              const r = radius * ((90 - el) / 90);
              return (
                <circle
                  key={el}
                  cx={centerX}
                  cy={centerY}
                  r={r}
                  fill="none"
                  stroke="#3a3f4b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Azimuth lines (every 30°) */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
              const x2 = centerX + radius * Math.cos(angle);
              const y2 = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="#3a3f4b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Cardinal directions */}
            <text x={centerX} y={centerY - radius - 10} textAnchor="middle" className="text-xs fill-secondary font-mono">N</text>
            <text x={centerX + radius + 10} y={centerY + 5} textAnchor="start" className="text-xs fill-secondary font-mono">E</text>
            <text x={centerX} y={centerY + radius + 20} textAnchor="middle" className="text-xs fill-secondary font-mono">S</text>
            <text x={centerX - radius - 10} y={centerY + 5} textAnchor="end" className="text-xs fill-secondary font-mono">W</text>

            {/* Trail (last 10 positions) */}
            {trail.length > 1 && trail.map((point, i) => {
              if (point.el < 0) return null;
              const pos = polarToCartesian(point.az, point.el);
              const opacity = (i + 1) / trail.length * 0.5;
              
              if (i < trail.length - 1) {
                const nextPos = polarToCartesian(trail[i + 1].az, trail[i + 1].el);
                return (
                  <line
                    key={i}
                    x1={pos.x}
                    y1={pos.y}
                    x2={nextPos.x}
                    y2={nextPos.y}
                    stroke="#00d4ff"
                    strokeWidth="2"
                    strokeOpacity={opacity}
                  />
                );
              }
              return null;
            })}

            {/* ISS position */}
            {isVisible && elevation >= 0 ? (
              <>
                <circle
                  cx={issPos.x}
                  cy={issPos.y}
                  r="6"
                  fill="#00d4ff"
                  className="animate-pulse"
                />
                <circle
                  cx={issPos.x}
                  cy={issPos.y}
                  r="10"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </>
            ) : (
              <>
                <circle
                  cx={centerX}
                  cy={centerY + radius}
                  r="6"
                  fill="#6b7280"
                  opacity="0.5"
                />
                <text
                  x={centerX}
                  y={centerY + radius + 25}
                  textAnchor="middle"
                  className="text-xs fill-secondary font-mono"
                >
                  NOT VISIBLE
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Azimuth</span>
          <span className="font-mono">{azimuth.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Elevation</span>
          <span className="font-mono">{elevation.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Direction</span>
          <span className="font-mono text-primary">{direction}</span>
        </div>
      </div>
    </div>
  );
};

export default SkyView;
