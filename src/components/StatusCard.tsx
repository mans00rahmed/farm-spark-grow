import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export default function StatusCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  variant = "default" 
}: StatusCardProps) {
  const variants = {
    default: "border-border",
    success: "border-success bg-success/5",
    warning: "border-warning bg-warning/5",
    danger: "border-destructive bg-destructive/5"
  };

  return (
    <Card className={cn("shadow-card", variants[variant])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
