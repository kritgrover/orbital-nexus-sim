import { useOrbitalTracking } from '@/hooks/useOrbitalTracking';
import Header from "@/components/Header";
import GlobeView from "@/components/globe/GlobeView";
import SkyView from "@/components/globe/SkyView";
import LinkStatus from "@/components/dashboard/LinkStatus";
import OrbitalParameters from "@/components/dashboard/OrbitalParameters";
import MessageExchange from "@/components/dashboard/MessageExchange";
import StationNetwork from "@/components/dashboard/StationNetwork";
import LinkBudgetChart from "@/components/analytics/LinkBudgetChart";
import PassPrediction from "@/components/analytics/PassPrediction";
import TrafficFlowMonitor from "@/components/analytics/TrafficFlowMonitor";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useState, useEffect } from "react";
import { DEFAULT_STATIONS, GroundStation } from "@/types/groundStation";

const Index = () => {
  // Only use orbital tracking connection - remove the duplicate /ws connection
  const { isConnected: orbitalConnected, orbitalData } = useOrbitalTracking();

  const [stations, setStations] = useState<GroundStation[]>(DEFAULT_STATIONS);
  const [activeStationId, setActiveStationId] = useState('toronto');
  const [handoffCount, setHandoffCount] = useState(0);

  // Update stations with real data from backend
  useEffect(() => {
    if (orbitalData?.stations) {
      setStations(prevStations => 
        prevStations.map(station => {
          const backendStation = orbitalData.stations.find(s => s.id === station.id);
          if (backendStation) {
            return {
              ...station,
              isActive: orbitalData.active_station_id === station.id,
              elevation: backendStation.look_angles?.elevation || 0,
              nextPassTime: backendStation.next_pass_minutes > 0 
                ? `${Math.floor(backendStation.next_pass_minutes / 60)}:${(backendStation.next_pass_minutes % 60).toString().padStart(2, '0')}`
                : '--:--'
            };
          }
          return station;
        })
      );

      // Update active station from backend
      if (orbitalData.active_station_id && orbitalData.active_station_id !== activeStationId) {
        const oldStation = activeStationId;
        setActiveStationId(orbitalData.active_station_id);
        setHandoffCount(prev => prev + 1);
        console.log(`🔄 Handoff: ${oldStation} → ${orbitalData.active_station_id}`);
      }
    }
  }, [orbitalData, activeStationId]);

  const handleStationSelect = (stationId: string) => {
    setActiveStationId(stationId);
  };

  const activeStation = stations.find(s => s.id === activeStationId);
  
  // Get active station data from orbital data with proper null checking
  const activeStationData = orbitalData?.stations?.find(s => s.id === activeStationId);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Pass orbital connection status to header */}
      <Header isConnected={orbitalConnected} connectionError={orbitalConnected ? null : "Connecting..."} />
      
      <main className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Globe View & Sky View */}
          <ResizablePanel defaultSize={28} minSize={20} className="bg-panel">
            <div className="h-full border-r border-border flex flex-col">
              <div className="flex-1 min-h-0">
                <GlobeView 
                  stations={stations}
                  activeStationId={activeStationId}
                  orbitalData={orbitalData}
                />
              </div>
              <div className="h-[420px]">
                <SkyView 
                  azimuth={activeStationData?.look_angles?.azimuth ?? 0} 
                  elevation={activeStationData?.look_angles?.elevation ?? 0} 
                  isVisible={activeStationData?.is_visible ?? false} 
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-muted hover:bg-primary/30 transition-colors" />

          {/* Center Panel - Communication Dashboard */}
          <ResizablePanel defaultSize={42} minSize={30}>
            <div className="h-full border-r border-border p-4 space-y-4 overflow-y-auto">
              <LinkStatus />
              <OrbitalParameters activeStation={activeStation?.name || 'Toronto'} />
              <MessageExchange 
                activeStationId={activeStationId}
                stationColor={activeStation?.color || '#4ade80'}
                handoffCount={handoffCount}
              />
              <StationNetwork 
                stations={stations}
                onStationSelect={handleStationSelect}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-muted hover:bg-primary/30 transition-colors" />

          {/* Right Panel - Analytics */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <LinkBudgetChart />
              <PassPrediction 
                handoffCount={handoffCount}
                stationsUsed={stations.filter(s => s.isActive || s.elevation > 0).length}
              />
              <TrafficFlowMonitor />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;