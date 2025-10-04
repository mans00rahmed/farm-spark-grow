import { Action, DayResult, NDVIRecord, WeatherRecord, SimulationResponse } from "@/types";

interface SimulationState {
  soilMoisture: number;
  nutrients: number;
  ndvi: number;
  yieldProjection: number;
  state: "healthy" | "stressed" | "recovering";
  healthyDays: number;
  stressedDays: number;
  overFertilizedStressDays: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getState(soilMoisture: number, nutrients: number): "healthy" | "stressed" | "recovering" {
  if (soilMoisture >= 50 && soilMoisture <= 80 && nutrients >= 55 && nutrients <= 85) {
    return "healthy";
  }
  if (soilMoisture < 45 || nutrients > 90) {
    return "stressed";
  }
  return "recovering";
}

function average(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

export function runSimulation(
  farmId: string,
  fromDate: string,
  toDate: string,
  actions: Action[],
  ndviData: NDVIRecord[],
  weatherData: WeatherRecord[]
): SimulationResponse {
  const timeline: DayResult[] = [];
  const warnings: string[] = [];
  const badges: string[] = [];
  
  // Create date range
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const dates: string[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  // Initial state
  const last14Days = ndviData.slice(-14);
  const initialNDVI = average(last14Days.map(d => d.ndvi));
  
  const state: SimulationState = {
    soilMoisture: 55,
    nutrients: 70,
    ndvi: initialNDVI,
    yieldProjection: Math.round(initialNDVI * 100),
    state: "healthy",
    healthyDays: 0,
    stressedDays: 0,
    overFertilizedStressDays: 0
  };
  
  let consecutiveHealthyDays = 0;
  const ndviHistory: number[] = last14Days.map(d => d.ndvi);
  
  // Check for warnings upfront
  const fertilizeActions = actions.filter(a => a.type === "fertilize");
  for (let i = 0; i < fertilizeActions.length; i++) {
    const actionDate = new Date(fertilizeActions[i].date);
    const withinTenDays = fertilizeActions.filter(a => {
      const diff = Math.abs(new Date(a.date).getTime() - actionDate.getTime());
      return diff <= 10 * 24 * 60 * 60 * 1000;
    });
    
    if (withinTenDays.length > 3 && !warnings.includes("High leaching risk; yields may drop despite high nutrients.")) {
      warnings.push("High leaching risk; yields may drop despite high nutrients.");
    }
  }
  
  actions.forEach(action => {
    const weather = weatherData.find(w => w.date === action.date);
    if (action.type === "irrigate" && weather && weather.precip_mm >= 8) {
      warnings.push(`Rain expected on ${action.date}; consider skipping irrigation.`);
    }
  });
  
  // Simulate each day
  dates.forEach((date, idx) => {
    const weather = weatherData.find(w => w.date === date);
    const ndviRecord = ndviData.find(n => n.date === date);
    const dayActions = actions.filter(a => a.date === date);
    
    // Weather & baseline
    state.soilMoisture -= 2; // evapotranspiration
    
    if (weather && weather.precip_mm >= 5) {
      state.soilMoisture += 5;
    }
    
    state.soilMoisture = clamp(state.soilMoisture, 0, 100);
    
    // Actions
    dayActions.forEach(action => {
      if (action.type === "irrigate") {
        state.soilMoisture += Math.min(12, action.amount / 2);
      } else if (action.type === "fertilize") {
        state.nutrients += Math.min(12, action.amount / 3);
        state.soilMoisture -= 4;
      }
    });
    
    state.soilMoisture = clamp(state.soilMoisture, 0, 100);
    
    // Nutrient decay
    state.nutrients -= 1;
    state.nutrients = clamp(state.nutrients, 0, 100);
    
    // Determine state
    const prevState = state.state;
    state.state = getState(state.soilMoisture, state.nutrients);
    
    // Track stress from over-fertilization
    if (state.nutrients > 90 && state.soilMoisture < 45) {
      state.overFertilizedStressDays++;
    }
    
    // Track consecutive healthy days
    if (state.state === "healthy") {
      consecutiveHealthyDays++;
      state.healthyDays++;
    } else {
      consecutiveHealthyDays = 0;
      if (state.state === "stressed") {
        state.stressedDays++;
      }
    }
    
    // NDVI adjustment
    let ndviToday = ndviRecord ? ndviRecord.ndvi : state.ndvi;
    
    if (state.soilMoisture >= 55 && state.soilMoisture <= 75 && state.state !== "stressed") {
      ndviToday += 0.01;
    }
    
    if (state.state === "stressed") {
      ndviToday -= 0.02;
    }
    
    ndviToday = clamp(ndviToday, 0.3, 0.9);
    state.ndvi = ndviToday;
    ndviHistory.push(ndviToday);
    
    // Keep only last 20 days for yield calculation
    if (ndviHistory.length > 20) {
      ndviHistory.shift();
    }
    
    // Yield projection
    state.yieldProjection = Math.round(average(ndviHistory) * 100);
    
    // Add to timeline
    timeline.push({
      date,
      soilMoisture: Math.round(state.soilMoisture),
      nutrients: Math.round(state.nutrients),
      ndvi: Math.round(state.ndvi * 100) / 100,
      yieldProjection: state.yieldProjection,
      state: state.state
    });
  });
  
  // Calculate points
  let points = state.healthyDays * 1;
  
  const initialYield = timeline[0]?.yieldProjection || 0;
  const finalYield = timeline[timeline.length - 1]?.yieldProjection || 0;
  
  if (finalYield - initialYield >= 5) {
    points += 2;
  }
  
  if (state.overFertilizedStressDays >= 2) {
    points -= 2;
  }
  
  points = Math.max(0, points);
  
  // Check badges
  const irrigateCount = actions.filter(a => a.type === "irrigate").length;
  const droughtStress = timeline.filter(d => d.state === "stressed" && d.soilMoisture < 45).length;
  
  if (irrigateCount <= 2 && droughtStress === 0) {
    badges.push("Water-Wise");
  }
  
  const maxNutrients = Math.max(...timeline.map(d => d.nutrients));
  if (maxNutrients <= 90) {
    badges.push("Balanced-Feed");
  }
  
  // Check for recovery within 3 days
  let recoveryFound = false;
  for (let i = 0; i < timeline.length - 3; i++) {
    if (timeline[i].state === "stressed" && 
        timeline[i + 1].state === "recovering" && 
        timeline[i + 2].state === "recovering" &&
        timeline[i + 3].state === "healthy") {
      recoveryFound = true;
      break;
    }
  }
  
  if (recoveryFound) {
    badges.push("Resilience");
  }
  
  return {
    timeline,
    points,
    badges,
    warnings
  };
}
