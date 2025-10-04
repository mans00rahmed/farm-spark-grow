import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedPlans } from "@/lib/storage";
import { SavedPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, Award } from "lucide-react";
import BadgeDisplay from "@/components/BadgeDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TimelineChart from "@/components/TimelineChart";

export default function History() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    setPlans(getSavedPlans().reverse()); // Most recent first
  }, []);

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
            Back to Home
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Simulation History</h1>
            <p className="text-muted-foreground mt-1">
              Review your past simulations and their outcomes
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Saved Plans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Run a simulation and save it to see it here
              </p>
              <Button onClick={() => navigate("/")} className="bg-gradient-primary">
                Go to Farms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{plan.farmName}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {plan.dateRange}
                          </span>
                          <span>
                            Saved: {new Date(plan.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedPlan(plan)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{plan.farmName} - Simulation Details</DialogTitle>
                          <DialogDescription>{plan.dateRange}</DialogDescription>
                        </DialogHeader>
                        
                        {selectedPlan && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">Points Earned</div>
                                <div className="text-2xl font-bold text-primary">
                                  {selectedPlan.points}
                                </div>
                              </div>
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">Final Yield</div>
                                <div className="text-2xl font-bold">
                                  {selectedPlan.finalYield}%
                                </div>
                              </div>
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">Actions</div>
                                <div className="text-2xl font-bold">
                                  {selectedPlan.actions.length}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Badges Earned</h4>
                              <BadgeDisplay badges={selectedPlan.simulation.badges} />
                            </div>

                            {selectedPlan.actions.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Actions Taken</h4>
                                <div className="space-y-2">
                                  {selectedPlan.actions.map((action, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 p-2 bg-muted rounded text-sm"
                                    >
                                      <span className="font-medium">{action.date}</span>
                                      <span className="capitalize">{action.type}</span>
                                      <span className="text-muted-foreground">
                                        {action.amount} {action.type === "irrigate" ? "mm" : "kg/ha"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <TimelineChart data={selectedPlan.simulation.timeline} />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Points</div>
                        <div className="text-lg font-bold">{plan.points}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <div>
                        <div className="text-sm text-muted-foreground">Final Yield</div>
                        <div className="text-lg font-bold">{plan.finalYield}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Badges</div>
                      <div className="flex gap-2">
                        {plan.simulation.badges.length > 0 ? (
                          plan.simulation.badges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                            >
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No badges</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
