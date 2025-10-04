import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DayResult } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TimelineChartProps {
  data: DayResult[];
}

export default function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Soil Moisture': d.soilMoisture,
    'Nutrients': d.nutrients,
    'NDVI': Math.round(d.ndvi * 100),
    'Yield': d.yieldProjection
  }));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Timeline Analysis</CardTitle>
        <CardDescription>Daily progression of key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Soil Moisture" 
              stroke="hsl(var(--info))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Nutrients" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="NDVI" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Yield" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
