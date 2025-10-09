import Header from "@/components/Header";
import GlobeView from "@/components/globe/GlobeView";
import LinkStatus from "@/components/dashboard/LinkStatus";
import OrbitalParameters from "@/components/dashboard/OrbitalParameters";
import MessageExchange from "@/components/dashboard/MessageExchange";
import LinkBudgetChart from "@/components/analytics/LinkBudgetChart";
import PassPrediction from "@/components/analytics/PassPrediction";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 grid grid-cols-12 gap-0">
        {/* Left Panel - Globe View (30%) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 border-r border-border bg-panel">
          <GlobeView />
        </div>

        {/* Center Panel - Communication Dashboard (40%) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-5 border-r border-border p-4 space-y-4 overflow-y-auto">
          <LinkStatus />
          <OrbitalParameters />
          <MessageExchange />
        </div>

        {/* Right Panel - Analytics (30%) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 p-4 space-y-4 overflow-y-auto">
          <LinkBudgetChart />
          <PassPrediction />
        </div>
      </main>
    </div>
  );
};

export default Index;
