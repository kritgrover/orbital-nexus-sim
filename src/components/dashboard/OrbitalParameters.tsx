import { Card } from "@/components/ui/card";

const OrbitalParameters = () => {
  const parameters = [
    { label: "Latitude", value: "45.2341°N" },
    { label: "Longitude", value: "79.4562°W" },
    { label: "Altitude", value: "408.2 km" },
    { label: "Velocity", value: "7.66 km/s" },
    { label: "Azimuth", value: "127.8°" },
    { label: "Elevation", value: "42.3°" },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-secondary mb-3">
        ORBITAL PARAMETERS
      </h3>
      
      <div className="space-y-2">
        {parameters.map((param) => (
          <div key={param.label} className="flex justify-between items-center py-1">
            <span className="text-xs text-secondary">{param.label}</span>
            <span className="text-xs font-mono text-right">{param.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-border space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Next Pass</span>
          <span className="font-mono">03:24:18</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Current Pass</span>
          <span className="font-mono">00:08:42</span>
        </div>
      </div>
    </Card>
  );
};

export default OrbitalParameters;
