import farmsData from "@/data/farms.json";
import ndviFarm1 from "@/data/ndvi-farm-1.json";
import ndviFarm2 from "@/data/ndvi-farm-2.json";
import weatherFarm1 from "@/data/weather-farm-1.json";
import weatherFarm2 from "@/data/weather-farm-2.json";
import { Farm, NDVIRecord, WeatherRecord } from "@/types";

export function getFarms(): Farm[] {
  return farmsData.features.map(f => ({
    id: f.properties.id,
    name: f.properties.name
  }));
}

export function getNDVIData(farmId: string): NDVIRecord[] {
  return farmId === "farm-1" ? ndviFarm1 : ndviFarm2;
}

export function getWeatherData(farmId: string): WeatherRecord[] {
  return farmId === "farm-1" ? weatherFarm1 : weatherFarm2;
}

export function getFarmGeometry(farmId: string) {
  const feature = farmsData.features.find(f => f.properties.id === farmId);
  return feature?.geometry;
}
