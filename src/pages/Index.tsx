import { useWebSocket } from '@/hooks/useWebSocket';
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
import { useState } from "react";
import { DEFAULT_STATIONS, GroundStation } from "@/types/groundStation";

const Index = () => {
  // WebSocket connection
  const WS_URL = 'ws://localhost:8000/ws';
  const { isConnected, connectionError } = useWebSocket(WS_URL);

  const [stations, setStations] = useState<GroundStation[]>(DEFAULT_STATIONS);
  const [activeStationId, setActiveStationId] = useState('toronto');
  const [handoffCount, setHandoffCount] = useState(0);

  const handleStationSelect = (stationId: string) => {
    setStations(prev => prev.map(s => ({
      ...s,
      isActive: s.id === stationId
    })));
    setActiveStationId(stationId);
  };

  const handleHandoff = (fromStation: string, toStation: string) => {
    setHandoffCount(prev => prev + 1);
    console.log(`Handoff: ${fromStation} → ${toStation}`);
  };

  const activeStation = stations.find(s => s.id === activeStationId);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} connectionError={connectionError} />
      
      <main className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Globe View & Sky View */}
          <ResizablePanel defaultSize={28} minSize={20} className="bg-panel">
            <div className="h-full border-r border-border flex flex-col">
              <div className="flex-1 min-h-0">
                <GlobeView 
                  stations={stations}
                  activeStationId={activeStationId}
                  onHandoff={handleHandoff}
                />
              </div>
              <div className="h-[420px]">
                <SkyView 
                  azimuth={activeStation?.elevation === 42.3 ? 127.8 : 85.3} 
                  elevation={activeStation?.elevation || 42.3} 
                  isVisible={true} 
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
                stationsUsed={stations.length}
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