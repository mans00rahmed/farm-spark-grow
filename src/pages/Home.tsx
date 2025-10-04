import { useNavigate } from "react-router-dom";
import { getFarms } from "@/lib/data-loader";
import FarmCard from "@/components/FarmCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, BookOpen, Trophy, Target } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const farms = getFarms();

  const handleFarmSelect = (farmId: string) => {
    navigate(`/dashboard/${farmId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sprout className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Farm Navigators
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Play, Learn, Earn — Optimize your farm operations with data-driven insights and sustainable practices
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Educational Game Section */}
          <Card className="shadow-card mb-8 border-primary/20 bg-gradient-primary">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-foreground/20 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary-foreground mb-2">
                      Farm Challenge
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Test your farming knowledge and learn sustainable practices through interactive scenarios
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/farm-challenge")}
                  variant="secondary"
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Start Challenge
                </Button>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-semibold mb-6">Select Your Farm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} onSelect={handleFarmSelect} />
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-card rounded-lg shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">📊</div>
              <h3 className="font-semibold mb-2">Monitor</h3>
              <p className="text-sm text-muted-foreground">
                Track soil health, nutrients, and crop vigor in real-time
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Optimize</h3>
              <p className="text-sm text-muted-foreground">
                Plan irrigation and fertilization for maximum yield
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">📚</div>
              <h3 className="font-semibold mb-2">Learn</h3>
              <p className="text-sm text-muted-foreground">
                Master sustainable farming through interactive challenges
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get points and badges for sustainable decisions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
