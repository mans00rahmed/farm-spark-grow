import { useParams, useNavigate } from "react-router-dom";
import { getFarms, getNDVIData, getWeatherData } from "@/lib/data-loader";
import StatusCard from "@/components/StatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Leaf, TrendingUp, Activity, ArrowLeft, Play, Camera } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  
  if (!farmId) {
    navigate("/");
    return null;
  }

  const farms = getFarms();
  const farm = farms.find(f => f.id === farmId);
  const ndviData = getNDVIData(farmId);
  const weatherData = getWeatherData(farmId);

  if (!farm) {
    navigate("/");
    return null;
  }

  // Calculate current status
  const latestNDVI = ndviData[ndviData.length - 1];
  const avgNDVI = ndviData.slice(-14).reduce((sum, d) => sum + d.ndvi, 0) / 14;
  const currentYield = Math.round(avgNDVI * 100);

  // Initial state values
  const soilMoisture = 55;
  const nutrients = 70;
  const state = "healthy";

  const getStateVariant = (state: string) => {
    if (state === "healthy") return "success";
    if (state === "stressed") return "danger";
    return "warning";
  };

  // Prepare chart data
  const last7Days = ndviData.slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NDVI: Math.round(d.ndvi * 100)
  }));

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{farm.name}</h1>
              <p className="text-muted-foreground mt-1">Last updated: {latestNDVI.date}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate(`/simulation/${farmId}`)}
                className="bg-gradient-primary"
              >
                <Play className="h-4 w-4 mr-2" />
                Plan Actions
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/photo-check/${farmId}`)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Photo Check
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/rewards")}
              >
                View Rewards
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
              >
                History
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard
            title="Soil Moisture"
            value={`${soilMoisture}%`}
            description="Optimal range: 50-80%"
            icon={Droplet}
            variant={soilMoisture >= 50 && soilMoisture <= 80 ? "success" : "warning"}
          />
          <StatusCard
            title="Nutrients"
            value={`${nutrients}%`}
            description="Optimal range: 55-85%"
            icon={Leaf}
            variant={nutrients >= 55 && nutrients <= 85 ? "success" : "warning"}
          />
          <StatusCard
            title="NDVI"
            value={latestNDVI.ndvi.toFixed(2)}
            description="Vegetation health index"
            icon={Activity}
            variant="default"
          />
          <StatusCard
            title="Yield Projection"
            value={`${currentYield}%`}
            description={`Current state: ${state}`}
            icon={TrendingUp}
            variant={getStateVariant(state)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>NDVI Trend (7 Days)</CardTitle>
              <CardDescription>Crop vigor over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NDVI" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Weather</CardTitle>
              <CardDescription>Last 7 days precipitation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weatherData.slice(-7).map((w) => (
                  <div key={w.date} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm font-medium">
                      {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {w.tmin}°C - {w.tmax}°C
                    </span>
                    <span className="text-sm font-semibold text-info">
                      {w.precip_mm}mm
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Why This Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Risk Reduction</h4>
                <p className="text-muted-foreground">
                  Monitor crop health in real-time to catch stress early and prevent yield loss
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Input Savings</h4>
                <p className="text-muted-foreground">
                  Optimize irrigation and fertilization to reduce costs while maintaining productivity
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Yield Gains</h4>
                <p className="text-muted-foreground">
                  Data-driven decisions help you achieve higher yields through better timing and resource allocation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
