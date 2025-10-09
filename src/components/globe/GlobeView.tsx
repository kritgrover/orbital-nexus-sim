import { Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const GlobeView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-secondary">
          ORBITAL TRACKING
        </h2>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Placeholder for 3D Globe - Will be enhanced later */}
        <div className="w-full aspect-square max-w-md border-2 border-muted rounded-full relative bg-panel/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🌍</div>
              <div className="text-xs font-mono text-secondary">ISS ORBITAL PATH</div>
              <div className="mt-4 text-xs font-mono">
                <div>LAT: 45.2°N</div>
                <div>LON: 79.4°W</div>
              </div>
            </div>
          </div>
          {/* Orbital path indicator */}
          <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
          {/* Ground station marker */}
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 border-2 border-success rounded-full" />
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
