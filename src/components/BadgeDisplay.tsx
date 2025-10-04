import { Award, Droplet, Leaf, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  badges: string[];
  size?: "sm" | "md" | "lg";
}

const badgeIcons: Record<string, { icon: typeof Award; color: string; description: string }> = {
  "Water-Wise": {
    icon: Droplet,
    color: "text-info",
    description: "Efficient water management"
  },
  "Balanced-Feed": {
    icon: Leaf,
    color: "text-success",
    description: "Optimal fertilization"
  },
  "Resilience": {
    icon: TrendingUp,
    color: "text-warning",
    description: "Quick recovery from stress"
  }
};

export default function BadgeDisplay({ badges, size = "md" }: BadgeDisplayProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  if (badges.length === 0) {
    return (
      <div className="text-muted-foreground text-sm italic">
        No badges earned yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => {
        const badgeData = badgeIcons[badge] || { icon: Award, color: "text-primary", description: badge };
        const Icon = badgeData.icon;
        
        return (
          <div
            key={badge}
            className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border shadow-sm"
            title={badgeData.description}
          >
            <Icon className={cn(sizes[size], badgeData.color)} />
            <span className="text-sm font-medium">{badge}</span>
          </div>
        );
      })}
    </div>
  );
}
