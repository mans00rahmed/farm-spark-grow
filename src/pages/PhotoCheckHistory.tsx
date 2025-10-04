import { useParams, useNavigate } from "react-router-dom";
import { getFarms } from "@/lib/data-loader";
import { getPhotoChecks } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Camera } from "lucide-react";

export default function PhotoCheckHistory() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();

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

  const photoChecks = getPhotoChecks(farmId);

  const urgencyColor = {
    low: "bg-success/20 text-success border-success/30",
    medium: "bg-warning/20 text-warning border-warning/30",
    high: "bg-destructive/20 text-destructive border-destructive/30"
  };

  const stressColor = {
    none: "text-success",
    drought: "text-warning",
    nutrient: "text-warning",
    pest_disease: "text-destructive",
    other: "text-muted-foreground"
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/photo-check/${farmId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Photo Check
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Photo Check History</h1>
            <p className="text-muted-foreground mt-1">{farm.name}</p>
          </div>
        </div>

        {photoChecks.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No photo checks yet. Upload crop photos to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {photoChecks.map((check) => (
              <Card key={check.id} className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {new Date(check.timestamp).toLocaleDateString()} at{" "}
                        {new Date(check.timestamp).toLocaleTimeString()}
                      </CardTitle>
                      <CardDescription>
                        Health Score: {check.healthScore}/100 • Confidence: {Math.round(check.confidence * 100)}%
                      </CardDescription>
                    </div>
                    <Badge className={urgencyColor[check.urgency]} variant="outline">
                      {check.urgency.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Health</div>
                      <div className="text-2xl font-bold text-primary">{check.healthScore}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Stress Type</div>
                      <div className={`font-semibold capitalize ${stressColor[check.stressType]}`}>
                        {check.stressType.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fix Applied</div>
                      <div className="font-semibold">
                        {check.fixApplied ? "✓ Yes" : "✗ No"}
                      </div>
                    </div>
                    {check.fixApplied && check.beforeYield !== undefined && check.afterYield !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Yield Impact</div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{check.beforeYield}%</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-bold text-primary">{check.afterYield}%</span>
                          {check.afterYield > check.beforeYield ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-1">Key Findings:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {check.keyFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-semibold mb-1">Advice:</div>
                    <p className="text-sm text-muted-foreground">{check.advice}</p>
                  </div>

                  {check.suggestedActions && check.suggestedActions.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Suggested Actions:</div>
                      <div className="space-y-2">
                        {check.suggestedActions.map((action, idx) => (
                          <div key={idx} className="text-sm p-2 border rounded">
                            <span className="font-medium capitalize">{action.type}</span> on {action.date}:{" "}
                            <span className="text-muted-foreground">{action.amount} {action.type === "irrigate" ? "mm" : "kg/ha"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
