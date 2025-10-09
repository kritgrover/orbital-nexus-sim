import Header from "@/components/Header";
import GlobeView from "@/components/globe/GlobeView";
import LinkStatus from "@/components/dashboard/LinkStatus";
import OrbitalParameters from "@/components/dashboard/OrbitalParameters";
import MessageExchange from "@/components/dashboard/MessageExchange";
import LinkBudgetChart from "@/components/analytics/LinkBudgetChart";
import PassPrediction from "@/components/analytics/PassPrediction";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Globe View */}
          <ResizablePanel defaultSize={28} minSize={20} className="bg-panel">
            <div className="h-full border-r border-border">
              <GlobeView />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-muted hover:bg-primary/30 transition-colors" />

          {/* Center Panel - Communication Dashboard */}
          <ResizablePanel defaultSize={42} minSize={30}>
            <div className="h-full border-r border-border p-4 space-y-4 overflow-y-auto">
              <LinkStatus />
              <OrbitalParameters />
              <MessageExchange />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-muted hover:bg-primary/30 transition-colors" />

          {/* Right Panel - Analytics */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <LinkBudgetChart />
              <PassPrediction />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
