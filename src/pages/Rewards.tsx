import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTotalPoints, deductPoints, addRedeemedItem, getRedeemedItems } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Award, ShoppingCart } from "lucide-react";
import { RewardItem } from "@/types";
import { toast } from "sonner";

const REWARD_ITEMS: RewardItem[] = [
  {
    id: "soil-test",
    name: "€10 off Soil Test",
    description: "Professional soil analysis to optimize nutrient management",
    cost: 25
  },
  {
    id: "weather-station",
    name: "€50 off Weather Station",
    description: "Advanced weather monitoring equipment for your farm",
    cost: 100
  },
  {
    id: "training-precision",
    name: "Precision Agriculture Training",
    description: "Online course on precision farming techniques",
    cost: 50
  },
  {
    id: "sensor-kit",
    name: "Soil Moisture Sensor Kit",
    description: "Set of 3 wireless soil moisture sensors",
    cost: 75
  },
  {
    id: "consultation",
    name: "Farm Consultation Session",
    description: "1-hour consultation with agricultural expert",
    cost: 150
  },
  {
    id: "fertilizer-discount",
    name: "€20 off Organic Fertilizer",
    description: "Discount on premium organic fertilizer products",
    cost: 40
  }
];

export default function Rewards() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  useEffect(() => {
    setPoints(getTotalPoints());
    setRedeemed(getRedeemedItems());
  }, []);

  const handleRedeem = (item: RewardItem) => {
    if (deductPoints(item.cost)) {
      addRedeemedItem(item.id);
      setPoints(getTotalPoints());
      setRedeemed(getRedeemedItems());
      
      toast.success("Reward redeemed!", {
        description: `You've redeemed ${item.name}. Check your email for details.`
      });
    } else {
      toast.error("Insufficient points", {
        description: `You need ${item.cost - points} more points to redeem this item.`
      });
    }
  };

  const isRedeemed = (itemId: string) => redeemed.includes(itemId);

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Rewards Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              Redeem your points for valuable farming resources
            </p>
          </div>
        </div>

        <Card className="shadow-elevated mb-8 border-primary/20 bg-gradient-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award className="h-12 w-12 text-primary-foreground" />
                <div>
                  <div className="text-sm text-primary-foreground/80 font-medium">Your Points</div>
                  <div className="text-4xl font-bold text-primary-foreground">{points}</div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate("/history")}
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Available Rewards</h2>
          <p className="text-muted-foreground">
            Earn more points by running simulations and making sustainable decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARD_ITEMS.map((item) => {
            const canAfford = points >= item.cost;
            const alreadyRedeemed = isRedeemed(item.id);

            return (
              <Card
                key={item.id}
                className={`shadow-card transition-all duration-300 ${
                  !canAfford && !alreadyRedeemed ? "opacity-60" : ""
                } ${alreadyRedeemed ? "border-success bg-success/5" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Cost</div>
                      <div className="text-2xl font-bold text-primary">{item.cost} pts</div>
                    </div>
                  </div>

                  {alreadyRedeemed ? (
                    <Button disabled className="w-full" variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Redeemed
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford}
                      className="w-full bg-gradient-primary"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Redeem
                    </Button>
                  )}

                  {!canAfford && !alreadyRedeemed && (
                    <p className="text-xs text-muted-foreground text-center">
                      Need {item.cost - points} more points
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {redeemed.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Your Redeemed Rewards</h2>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {REWARD_ITEMS.filter(item => isRedeemed(item.id)).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-success" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{item.cost} pts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
