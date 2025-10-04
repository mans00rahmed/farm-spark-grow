import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFarms, getNDVIData, getWeatherData } from "@/lib/data-loader";
import { runSimulation } from "@/lib/simulation";
import { savePlan, addPoints } from "@/lib/storage";
import { Action, SimulationResponse, SavedPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Play } from "lucide-react";
import ActionPlanner from "@/components/ActionPlanner";
import TimelineChart from "@/components/TimelineChart";
import BadgeDisplay from "@/components/BadgeDisplay";
import { toast } from "sonner";

export default function Simulation() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [actions, setActions] = useState<Action[]>([]);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!farmId) {
    navigate("/");
    return null;
  }

  const farms = getFarms();
  const farm = farms.find(f => f.id === farmId);
  
  if (!farm) {
    navigate("/");
    return null;
  }

  const ndviData = getNDVIData(farmId);
  const weatherData = getWeatherData(farmId);

  // Use the date range from the mock data
  const dateRange = {
    from: "2025-09-05",
    to: "2025-10-04"
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const result = runSimulation(
        farmId,
        dateRange.from,
        dateRange.to,
        actions,
        ndviData,
        weatherData
      );
      
      setSimulation(result);
      setIsRunning(false);
      
      toast.success("Simulation complete!", {
        description: `Earned ${result.points} points and ${result.badges.length} badges`
      });
    }, 500);
  };

  const handleSavePlan = () => {
    if (!simulation) return;

    const plan: SavedPlan = {
      id: Date.now().toString(),
      farmId,
      farmName: farm.name,
      dateRange: `${dateRange.from} to ${dateRange.to}`,
      points: simulation.points,
      finalYield: simulation.timeline[simulation.timeline.length - 1].yieldProjection,
      timestamp: new Date().toISOString(),
      simulation,
      actions
    };

    savePlan(plan);
    addPoints(simulation.points);
    
    toast.success("Plan saved successfully!", {
      description: `${simulation.points} points added to your account`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dashboard/${farmId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Simulation Planner</h1>
            <p className="text-muted-foreground mt-1">
              {farm.name} • {dateRange.from} to {dateRange.to}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <ActionPlanner
            onActionsChange={setActions}
            dateRange={dateRange}
          />

          <div className="flex gap-4">
            <Button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="bg-gradient-primary"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {isRunning ? "Running..." : "Run Simulation"}
            </Button>
            
            {simulation && (
              <Button
                onClick={handleSavePlan}
                variant="outline"
                size="lg"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Plan
              </Button>
            )}
          </div>

          {simulation && (
            <>
              {simulation.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="font-semibold mb-2">Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {simulation.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Results Summary</CardTitle>
                    <CardDescription>Performance metrics for this simulation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Points Earned</div>
                      <div className="text-3xl font-bold text-primary">{simulation.points}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Badges Earned</div>
                      <BadgeDisplay badges={simulation.badges} />
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Final Yield Projection</div>
                      <div className="text-2xl font-bold">
                        {simulation.timeline[simulation.timeline.length - 1].yieldProjection}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>State Distribution</CardTitle>
                    <CardDescription>Days in each health state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["healthy", "recovering", "stressed"].map(state => {
                        const count = simulation.timeline.filter(d => d.state === state).length;
                        const percentage = Math.round((count / simulation.timeline.length) * 100);
                        
                        return (
                          <div key={state}>
                            <div className="flex justify-between mb-2">
                              <span className="capitalize font-medium">{state}</span>
                              <span className="text-muted-foreground">{count} days ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  state === "healthy" ? "bg-success" :
                                  state === "stressed" ? "bg-destructive" :
                                  "bg-warning"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <TimelineChart data={simulation.timeline} />

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Timeline Details</CardTitle>
                  <CardDescription>Daily breakdown of all metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-right p-2">Soil %</th>
                          <th className="text-right p-2">Nutrients %</th>
                          <th className="text-right p-2">NDVI</th>
                          <th className="text-right p-2">Yield %</th>
                          <th className="text-left p-2">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulation.timeline.map((day) => (
                          <tr key={day.date} className="border-b hover:bg-muted/50">
                            <td className="p-2">{day.date}</td>
                            <td className="text-right p-2">{day.soilMoisture}</td>
                            <td className="text-right p-2">{day.nutrients}</td>
                            <td className="text-right p-2">{day.ndvi}</td>
                            <td className="text-right p-2">{day.yieldProjection}</td>
                            <td className="p-2">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  day.state === "healthy" ? "bg-success/20 text-success" :
                                  day.state === "stressed" ? "bg-destructive/20 text-destructive" :
                                  "bg-warning/20 text-warning"
                                }`}
                              >
                                {day.state}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
