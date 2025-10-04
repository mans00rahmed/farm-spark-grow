import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFarms, getNDVIData, getWeatherData } from "@/lib/data-loader";
import { runSimulation } from "@/lib/simulation";
import { savePhotoCheck, updatePhotoCheck, addPoints, getAcceptedFixesThisMonth, getPhotoChecks } from "@/lib/storage";
import { Action, PhotoCheckResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Camera, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PhotoCheck() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<PhotoCheckResult | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }

    // Basic quality checks
    const issues: string[] = [];
    
    files.forEach((file, idx) => {
      if (file.size > 10 * 1024 * 1024) {
        issues.push(`Photo ${idx + 1}: File too large (max 10MB)`);
      }
      if (!file.type.startsWith('image/')) {
        issues.push(`Photo ${idx + 1}: Not a valid image file`);
      }
    });

    if (issues.length > 0) {
      setQualityIssues(issues);
      return;
    }

    setQualityIssues([]);
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        selectedFiles.map(file => convertToBase64(file))
      );

      const { data, error } = await supabase.functions.invoke('analyze-crop-photo', {
        body: { images: base64Images }
      });

      if (error) throw error;

      // Detect conflicts with current plan and weather
      const conflicts: string[] = [];
      const today = new Date();
      const next3Days = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split('T')[0];
      });

      // Check weather conflicts
      if (data.suggestedActions) {
        data.suggestedActions.forEach((action: Action) => {
          const weather = weatherData.find(w => w.date === action.date);
          if (action.type === "irrigate" && weather && weather.precip_mm >= 8) {
            conflicts.push(`Suggested irrigation on ${action.date} conflicts with expected rain (${weather.precip_mm}mm)`);
          }
        });
      }

      const result: PhotoCheckResult = {
        id: Date.now().toString(),
        farmId,
        timestamp: new Date().toISOString(),
        ...data,
        conflicts,
        fixApplied: false
      };

      savePhotoCheck(result);
      setAnalysis(result);
      
      toast.success("Photo analysis complete!", {
        description: `Health score: ${result.healthScore}/100`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze photos", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = async () => {
    if (!analysis || !analysis.suggestedActions) return;

    setIsApplyingFix(true);

    try {
      const dateRange = {
        from: "2025-09-05",
        to: "2025-10-04"
      };

      // Run simulation without fix (current state)
      const beforeSimulation = runSimulation(
        farmId,
        dateRange.from,
        dateRange.to,
        [],
        ndviData,
        weatherData
      );

      const beforeYield = beforeSimulation.timeline[beforeSimulation.timeline.length - 1].yieldProjection;

      // Run simulation with fix
      const afterSimulation = runSimulation(
        farmId,
        dateRange.from,
        dateRange.to,
        analysis.suggestedActions,
        ndviData,
        weatherData
      );

      const afterYield = afterSimulation.timeline[afterSimulation.timeline.length - 1].yieldProjection;

      // Update photo check with results
      updatePhotoCheck(analysis.id, {
        fixApplied: true,
        beforeYield,
        afterYield
      });

      // Award points
      addPoints(2);

      // Check for Data-Driven badge
      const fixesThisMonth = getAcceptedFixesThisMonth();
      if (fixesThisMonth >= 3) {
        toast.success("Badge earned: Data-Driven! 🏆", {
          description: "You've accepted 3 corrective fixes this month"
        });
      }

      setAnalysis({ ...analysis, fixApplied: true, beforeYield, afterYield });
      
      toast.success("Fix applied successfully!", {
        description: `+2 points earned. Yield projection: ${beforeYield}% → ${afterYield}%`
      });
    } catch (error) {
      console.error('Apply fix error:', error);
      toast.error("Failed to apply fix");
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleViewHistory = () => {
    navigate(`/photo-check-history/${farmId}`);
  };

  const urgencyColor = {
    low: "bg-success/20 text-success border-success/30",
    medium: "bg-warning/20 text-warning border-warning/30",
    high: "bg-destructive/20 text-destructive border-destructive/30"
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
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Photo Check</h1>
              <p className="text-muted-foreground mt-1">{farm.name} • AI Crop Health Analysis</p>
            </div>
            <Button variant="outline" onClick={handleViewHistory}>
              <Clock className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Upload Crop Photos</CardTitle>
              <CardDescription>
                Take 1-3 clear photos of crop leaves and canopy. Good lighting and focus are essential.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Photos
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
              </div>

              {qualityIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="font-semibold mb-2">Quality Issues Detected:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {qualityIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={selectedFiles.length === 0 || isAnalyzing}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Photos"}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <>
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Diagnosis Results</CardTitle>
                      <CardDescription>AI-powered crop health assessment</CardDescription>
                    </div>
                    <Badge className={urgencyColor[analysis.urgency]} variant="outline">
                      {analysis.urgency.toUpperCase()} URGENCY
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Health Score</div>
                      <div className="text-3xl font-bold text-primary">{analysis.healthScore}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="text-3xl font-bold">{Math.round(analysis.confidence * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Stress Type</div>
                      <div className="text-lg font-bold capitalize">{analysis.stressType.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Urgency</div>
                      <div className="text-lg font-bold capitalize">{analysis.urgency}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Findings</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.keyFindings.map((finding, idx) => (
                        <li key={idx} className="text-muted-foreground">{finding}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Expert Advice</h4>
                    <p className="text-muted-foreground">{analysis.advice}</p>
                  </div>

                  {analysis.conflicts.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Detected Conflicts:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.conflicts.map((conflict, idx) => (
                            <li key={idx}>{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Suggested Actions</CardTitle>
                    <CardDescription>Recommended interventions based on analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {analysis.suggestedActions.map((action, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold capitalize">{action.type}</span>
                              <span className="text-muted-foreground ml-2">on {action.date}</span>
                            </div>
                            <Badge variant="outline">{action.amount} {action.type === "irrigate" ? "mm" : "kg/ha"}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{action.reason}</p>
                        </div>
                      ))}
                    </div>

                    {!analysis.fixApplied && (
                      <Button
                        onClick={handleApplyFix}
                        disabled={isApplyingFix}
                        className="w-full bg-gradient-primary"
                        size="lg"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        {isApplyingFix ? "Applying..." : "Apply Fix & Run Simulation"}
                      </Button>
                    )}

                    {analysis.fixApplied && analysis.beforeYield !== undefined && analysis.afterYield !== undefined && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Simulation Results</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Before Fix</div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">{analysis.beforeYield}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">After Fix</div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-primary">{analysis.afterYield}%</span>
                              {analysis.afterYield > analysis.beforeYield ? (
                                <TrendingUp className="h-5 w-5 text-success" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm text-muted-foreground">Points earned: </span>
                          <span className="font-bold text-primary">+2</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
