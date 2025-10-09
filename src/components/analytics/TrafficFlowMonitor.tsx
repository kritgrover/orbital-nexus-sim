import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PacketQueueItem {
  id: number;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

const TrafficFlowMonitor = () => {
  const [uplinkBandwidth, setUplinkBandwidth] = useState(2.4);
  const [downlinkBandwidth, setDownlinkBandwidth] = useState(8.7);
  const [packetQueue, setPacketQueue] = useState<PacketQueueItem[]>([]);
  const [throughputData, setThroughputData] = useState<Array<{time: string, uplink: number, downlink: number}>>([]);
  const [queueStats, setQueueStats] = useState({ avgTime: 45, maxDepth: 12 });
  const [packetSizes, setPacketSizes] = useState([12, 28, 35, 18, 5, 2]);
  const [protocolData, setProtocolData] = useState([
    { name: 'HTTP/HTTPS', value: 42.3, color: '#00d4ff' },
    { name: 'TCP Control', value: 28.7, color: '#3b82f6' },
    { name: 'UDP Telemetry', value: 24.1, color: '#4ade80' },
    { name: 'ICMP/Other', value: 4.9, color: '#6b7280' },
  ]);

  // Initialize throughput data
  useEffect(() => {
    const initialData = [];
    for (let i = 60; i >= 0; i -= 5) {
      initialData.push({
        time: `-${i}s`,
        uplink: Math.random() * 3 + 1.5,
        downlink: Math.random() * 10 + 5,
      });
    }
    setThroughputData(initialData);
  }, []);

  // Update bandwidth and throughput data
  useEffect(() => {
    const interval = setInterval(() => {
      const newUplink = Math.random() * 4 + 1;
      const newDownlink = Math.random() * 12 + 4;
      
      setUplinkBandwidth(newUplink);
      setDownlinkBandwidth(newDownlink);

      setThroughputData(prev => {
        const newData = [...prev.slice(1), {
          time: '0s',
          uplink: newUplink,
          downlink: newDownlink,
        }];
        return newData;
      });

      // Update queue stats
      setQueueStats({
        avgTime: Math.floor(Math.random() * 30 + 30),
        maxDepth: Math.floor(Math.random() * 8 + 8),
      });

      // Occasionally update packet sizes
      if (Math.random() > 0.7) {
        setPacketSizes([
          Math.floor(Math.random() * 10 + 8),
          Math.floor(Math.random() * 15 + 20),
          Math.floor(Math.random() * 10 + 30),
          Math.floor(Math.random() * 10 + 13),
          Math.floor(Math.random() * 5 + 3),
          Math.floor(Math.random() * 3 + 1),
        ]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Manage packet queue
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new packet
      if (Math.random() > 0.3 && packetQueue.length < 15) {
        const priority = Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'normal' : 'low';
        setPacketQueue(prev => [...prev, {
          id: Date.now(),
          priority,
          timestamp: Date.now(),
        }]);
      }

      // Remove old packet
      if (packetQueue.length > 0 && Math.random() > 0.4) {
        setPacketQueue(prev => prev.slice(1));
      }
    }, 800);

    return () => clearInterval(interval);
  }, [packetQueue.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'normal': return '#00d4ff';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const totalPackets = protocolData.reduce((sum, p) => sum + p.value, 0) * 100;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-secondary mb-4">
        TRAFFIC FLOW MONITOR
      </h3>

      {/* 1. Uplink/Downlink Bandwidth Usage */}
      <div className="mb-4 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">UPLINK</span>
            <span className="text-xs font-mono text-muted-foreground">{uplinkBandwidth.toFixed(1)} Mbps / 10 Mbps</span>
          </div>
          <div className="h-3 bg-[#1a1d29] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${(uplinkBandwidth / 10) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">DOWNLINK</span>
            <span className="text-xs font-mono text-muted-foreground">{downlinkBandwidth.toFixed(1)} Mbps / 25 Mbps</span>
          </div>
          <div className="h-3 bg-[#1a1d29] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out"
              style={{ width: `${(downlinkBandwidth / 25) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Packet Queue Visualization */}
      <div className="mb-4 p-3 bg-[#1a1d29] rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">PACKET QUEUE</span>
          <span className="text-xs font-mono text-muted-foreground">Queue: {packetQueue.length} packets</span>
        </div>
        <div className="flex gap-1 mb-2 h-5 items-center">
          {packetQueue.slice(0, 15).map((packet) => (
            <div
              key={packet.id}
              className="w-[30px] h-5 rounded animate-fade-in"
              style={{
                backgroundColor: getPriorityColor(packet.priority),
                boxShadow: `0 0 8px ${getPriorityColor(packet.priority)}50`,
              }}
            />
          ))}
          {packetQueue.length === 0 && (
            <span className="text-xs text-muted-foreground/50 italic">No packets in queue</span>
          )}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Avg Queue Time: {queueStats.avgTime} ms</span>
          <span>Max Queue Depth: {queueStats.maxDepth} packets</span>
        </div>
      </div>

      {/* 3. Throughput Graph Over Time */}
      <div className="mb-4 p-3 bg-[#1a1d29] rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
            <div className="text-cyan-400">Uplink: {uplinkBandwidth.toFixed(1)} Mbps</div>
            <div className="text-green-400">Downlink: {downlinkBandwidth.toFixed(1)} Mbps</div>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-cyan-500 rounded-sm" />
              <span className="text-muted-foreground">Uplink</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-muted-foreground">Downlink</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={throughputData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3f4b" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280" 
              style={{ fontSize: '10px' }}
              tick={{ fill: '#6b7280' }}
              domain={[0, 30]}
            />
            <Line 
              type="monotone" 
              dataKey="uplink" 
              stroke="#00d4ff" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="downlink" 
              stroke="#4ade80" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Packet Size Distribution Histogram */}
      <div className="mb-4 p-3 bg-[#1a1d29] rounded-lg">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
          PACKET SIZE DISTRIBUTION
        </div>
        <div className="flex justify-between items-end gap-1 h-24">
          {['0-64B', '65-256B', '257-512B', '513-1024B', '1025-1500B', '>1500B'].map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-cyan-400">{packetSizes[idx]}%</span>
              <div 
                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-500"
                style={{ height: `${packetSizes[idx] * 2}%` }}
              />
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Protocol Breakdown */}
      <div className="p-3 bg-[#1a1d29] rounded-lg">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
          PROTOCOL DISTRIBUTION
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {protocolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-20 pointer-events-none">
              <div className="text-xs font-mono text-muted-foreground">Total:</div>
              <div className="text-sm font-mono text-foreground">{Math.floor(totalPackets)}</div>
              <div className="text-[9px] text-muted-foreground">packets</div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {protocolData.map((protocol) => (
              <div key={protocol.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: protocol.color }}
                  />
                  <span className="text-muted-foreground">{protocol.name}</span>
                </div>
                <span className="font-mono text-foreground">{protocol.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TrafficFlowMonitor;
