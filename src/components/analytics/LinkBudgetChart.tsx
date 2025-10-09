import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const LinkBudgetChart = () => {
  const data = [
    { time: '14:25', snr: 12 },
    { time: '14:26', snr: 14 },
    { time: '14:27', snr: 18 },
    { time: '14:28', snr: 22 },
    { time: '14:29', snr: 24 },
    { time: '14:30', snr: 26 },
    { time: '14:31', snr: 24 },
    { time: '14:32', snr: 20 },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-secondary mb-3">
        LINK BUDGET
      </h3>
      
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'hsl(var(--secondary))', fontSize: 10 }}
            stroke="hsl(var(--muted))"
          />
          <YAxis 
            label={{ value: 'SNR (dB)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--secondary))', fontSize: 10 } }}
            tick={{ fill: 'hsl(var(--secondary))', fontSize: 10 }}
            stroke="hsl(var(--muted))"
          />
          <Line 
            type="monotone" 
            dataKey="snr" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LinkBudgetChart;
