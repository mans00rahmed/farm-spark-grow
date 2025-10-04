export interface Farm {
  id: string;
  name: string;
}

export interface Action {
  date: string;
  type: "irrigate" | "fertilize";
  amount: number;
}

export interface DayResult {
  date: string;
  soilMoisture: number;
  nutrients: number;
  ndvi: number;
  yieldProjection: number;
  state: "healthy" | "stressed" | "recovering";
}

export interface SimulationRequest {
  farmId: string;
  from: string;
  to: string;
  actions: Action[];
}

export interface SimulationResponse {
  timeline: DayResult[];
  points: number;
  badges: string[];
  warnings: string[];
}

export interface NDVIRecord {
  date: string;
  ndvi: number;
}

export interface WeatherRecord {
  date: string;
  tmin: number;
  tmax: number;
  precip_mm: number;
}

export interface SavedPlan {
  id: string;
  farmId: string;
  farmName: string;
  dateRange: string;
  points: number;
  finalYield: number;
  timestamp: string;
  simulation: SimulationResponse;
  actions: Action[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface PhotoCheckResult {
  id: string;
  farmId: string;
  timestamp: string;
  healthScore: number;
  stressType: "drought" | "nutrient" | "pest_disease" | "other" | "none";
  confidence: number;
  keyFindings: string[];
  urgency: "low" | "medium" | "high";
  advice: string;
  suggestedActions: Array<{
    date: string;
    type: "irrigate" | "fertilize";
    amount: number;
    reason: string;
  }> | null;
  conflicts: string[];
  fixApplied: boolean;
  beforeYield?: number;
  afterYield?: number;
}
