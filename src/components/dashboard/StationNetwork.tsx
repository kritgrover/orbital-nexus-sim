import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroundStation } from "@/types/groundStation";

interface StationNetworkProps {
  stations: GroundStation[];
  onStationSelect: (stationId: string) => void;
  onAddStation?: () => void;
}

const StationNetwork = ({ stations, onStationSelect, onAddStation }: StationNetworkProps) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-secondary">
          GROUND STATION NETWORK
        </h3>
        {onAddStation && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 px-2 text-[10px]"
            onClick={onAddStation}
          >
            <Plus className="h-3 w-3 mr-1" />
            ADD
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {stations.map((station) => (
          <div
            key={station.id}
            onClick={() => onStationSelect(station.id)}
            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
              station.isActive
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-border/60 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  station.isActive ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: station.isActive ? station.color : '#6b7280',
                  boxShadow: station.isActive ? `0 0 8px ${station.color}` : 'none'
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono truncate">
                  {station.name}
                </div>
                <div className="text-[10px] text-secondary truncate">
                  {station.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-secondary">
                  {station.isActive ? 'ACTIVE' : 'IDLE'}
                </div>
                {station.isActive ? (
                  <div className="text-xs font-mono">
                    Elev: {station.elevation.toFixed(1)}°
                  </div>
                ) : (
                  <div className="text-xs font-mono text-secondary/60">
                    Next: {station.nextPassTime}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StationNetwork;
