import { SavedPlan } from "@/types";

const STORAGE_KEY = "farm_navigator_plans";
const POINTS_KEY = "farm_navigator_points";
const REDEEMED_KEY = "farm_navigator_redeemed";

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
