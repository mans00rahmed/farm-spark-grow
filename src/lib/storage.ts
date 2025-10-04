import { SavedPlan, PhotoCheckResult } from "@/types";

const STORAGE_KEY = "farm_navigator_plans";
const POINTS_KEY = "farm_navigator_points";
const REDEEMED_KEY = "farm_navigator_redeemed";
const PHOTO_CHECKS_KEY = "farm_navigator_photo_checks";

export function getSavedPlans(): SavedPlan[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlan(plan: SavedPlan): void {
  const plans = getSavedPlans();
  plans.push(plan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function getTotalPoints(): number {
  const data = localStorage.getItem(POINTS_KEY);
  return data ? parseInt(data) : 0;
}

export function addPoints(points: number): void {
  const current = getTotalPoints();
  localStorage.setItem(POINTS_KEY, (current + points).toString());
}

export function deductPoints(points: number): boolean {
  const current = getTotalPoints();
  if (current >= points) {
    localStorage.setItem(POINTS_KEY, (current - points).toString());
    return true;
  }
  return false;
}

export function getRedeemedItems(): string[] {
  const data = localStorage.getItem(REDEEMED_KEY);
  return data ? JSON.parse(data) : [];
}

export function addRedeemedItem(itemId: string): void {
  const items = getRedeemedItems();
  items.push(itemId);
  localStorage.setItem(REDEEMED_KEY, JSON.stringify(items));
}

export function getPhotoChecks(farmId?: string): PhotoCheckResult[] {
  const stored = localStorage.getItem(PHOTO_CHECKS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return farmId ? all.filter((pc: PhotoCheckResult) => pc.farmId === farmId) : all;
}

export function savePhotoCheck(check: PhotoCheckResult): void {
  const checks = getPhotoChecks();
  checks.unshift(check);
  localStorage.setItem(PHOTO_CHECKS_KEY, JSON.stringify(checks));
}

export function updatePhotoCheck(id: string, updates: Partial<PhotoCheckResult>): void {
  const checks = getPhotoChecks();
  const index = checks.findIndex(c => c.id === id);
  if (index !== -1) {
    checks[index] = { ...checks[index], ...updates };
    localStorage.setItem(PHOTO_CHECKS_KEY, JSON.stringify(checks));
  }
}

export function getAcceptedFixesThisMonth(): number {
  const checks = getPhotoChecks();
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return checks.filter(c => 
    c.fixApplied && new Date(c.timestamp) > monthAgo
  ).length;
}
