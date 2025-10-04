import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Farm } from "@/types";

interface FarmCardProps {
  farm: Farm;
  onSelect: (farmId: string) => void;
}

export default function FarmCard({ farm, onSelect }: FarmCardProps) {
  return (
    <Card className="hover:shadow-elevated transition-all duration-300 cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {farm.name}
            </CardTitle>
            <CardDescription className="flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              Athlone, Ireland
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-32 bg-gradient-earth rounded-lg flex items-center justify-center text-muted-foreground">
            <MapPin className="h-12 w-12" />
          </div>
          <Button 
            onClick={() => onSelect(farm.id)}
            className="w-full bg-gradient-primary"
          >
            View Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
