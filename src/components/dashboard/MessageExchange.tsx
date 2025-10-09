import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import ProtocolStack from "./ProtocolStack";

const MessageExchange = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "ISS> Telemetry packet received", success: true, time: "14:30:12" },
    { text: "GND> Command acknowledged", success: true, time: "14:30:15" },
    { text: "ISS> System status nominal", success: true, time: "14:31:02" },
    { text: "GND> Request orbital data", success: true, time: "14:31:45" },
    { text: "ISS> Transmitting orbital parameters", success: false, time: "14:32:01" },
  ]);
  const [protocolDirection, setProtocolDirection] = useState<'uplink' | 'downlink' | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      // Trigger uplink animation
      setProtocolDirection('uplink');
      
      setMessages([...messages, {
        text: `GND> ${message}`,
        success: true,
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      }]);
      setMessage("");

      // Simulate downlink response after uplink completes
      setTimeout(() => {
        setProtocolDirection('downlink');
        setMessages(prev => [...prev, {
          text: `ISS> Acknowledged: ${message.substring(0, 20)}...`,
          success: true,
          time: new Date().toLocaleTimeString('en-US', { hour12: false })
        }]);
      }, 1200);

      // Reset protocol animation
      setTimeout(() => {
        setProtocolDirection(null);
      }, 2500);
    }
  };

  return (
    <Card className="p-4 flex h-[280px]">
      {/* Protocol Stack - Left side */}
      <div className="w-32 flex-shrink-0 border-r border-border pr-3 mr-3">
        <div className="text-[9px] font-semibold tracking-wider uppercase text-secondary mb-2">
          PROTOCOL
        </div>
        <ProtocolStack direction={protocolDirection} />
      </div>

      {/* Message Terminal - Right side */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-secondary">
            MESSAGE EXCHANGE
          </h3>
          <span className="text-xs font-mono text-secondary">Queue: 3</span>
        </div>
        
        <div className="flex-1 terminal p-2 overflow-y-auto space-y-1 mb-3">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-mono">
              {msg.success ? (
                <CheckCircle className="w-3 h-3 text-terminal-text flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <span className="text-terminal-text flex-1">{msg.text}</span>
              <span className="text-terminal-text/60 text-[10px]">{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter uplink message..."
            className="flex-1 h-8 text-xs font-mono bg-terminal-bg text-terminal-text border-muted"
          />
          <Button 
            onClick={handleSend}
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs"
          >
            <Send className="h-3 w-3 mr-1" />
            SEND
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MessageExchange;
