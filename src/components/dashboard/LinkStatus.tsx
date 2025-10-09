import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LinkStatus = () => {
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
        <div className="text-xs font-mono">+2.34 kHz</div>
      </div>
    </Card>
  );
};

export default LinkStatus;
