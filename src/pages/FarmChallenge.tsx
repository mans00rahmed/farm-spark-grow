import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Trophy, BookOpen, Target, Zap, Leaf, Droplet, Sun } from "lucide-react";
import { toast } from "sonner";
import { addPoints } from "@/lib/storage";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "soil" | "water" | "nutrients" | "pests" | "weather" | "sustainability";
  difficulty: "beginner" | "intermediate" | "advanced";
  scenario: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }>;
  educationalTip: string;
  icon: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: "soil-ph-test",
    title: "Soil pH Management",
    category: "soil",
    difficulty: "beginner",
    icon: "🧪",
    scenario: "Your soil test shows a pH of 5.2, which is too acidic for most crops. Your corn plants are showing yellowing leaves and stunted growth.",
    question: "What's the best approach to correct this soil pH issue?",
    options: [
      {
        id: "lime",
        text: "Apply agricultural lime to raise pH gradually over 6-12 months",
        isCorrect: true,
        explanation: "Agricultural lime is the safest and most effective way to raise soil pH. It should be applied gradually to avoid shocking the soil ecosystem.",
        points: 10
      },
      {
        id: "quick-fix",
        text: "Apply a large amount of lime immediately for quick results",
        isCorrect: false,
        explanation: "Applying too much lime at once can shock soil microorganisms and cause nutrient imbalances.",
        points: 0
      },
      {
        id: "ignore",
        text: "Ignore the pH and just add more fertilizer",
        isCorrect: false,
        explanation: "Low pH prevents plants from absorbing nutrients properly, so adding more fertilizer won't help.",
        points: 0
      },
      {
        id: "acid",
        text: "Add more acidic materials to make it even more acidic",
        isCorrect: false,
        explanation: "This would make the problem worse. Most crops prefer slightly acidic to neutral pH (6.0-7.0).",
        points: 0
      }
    ],
    educationalTip: "Soil pH affects nutrient availability. Most crops prefer pH 6.0-7.0. Regular soil testing helps maintain optimal conditions.",
    description: "Learn about soil pH and its impact on crop health"
  },
  {
    id: "irrigation-timing",
    title: "Smart Irrigation",
    category: "water",
    difficulty: "intermediate",
    icon: "💧",
    scenario: "It's mid-summer, and your weather forecast shows 80% chance of rain tomorrow. Your soil moisture sensors show 45% moisture. Your crops need irrigation today.",
    question: "Should you irrigate today given the forecast?",
    options: [
      {
        id: "wait",
        text: "Wait for the rain and skip irrigation today",
        isCorrect: true,
        explanation: "With 80% chance of rain and soil moisture at 45%, waiting is the most water-efficient choice. Over-irrigation wastes water and can cause root rot.",
        points: 15
      },
      {
        id: "irrigate-light",
        text: "Apply light irrigation (5mm) to bridge the gap",
        isCorrect: false,
        explanation: "Even light irrigation before heavy rain can lead to waterlogging and nutrient leaching.",
        points: 5
      },
      {
        id: "irrigate-full",
        text: "Apply full irrigation as planned - better safe than sorry",
        isCorrect: false,
        explanation: "This wastes water and can cause waterlogging, especially if the rain comes as forecast.",
        points: 0
      },
      {
        id: "check-sensors",
        text: "Check other soil moisture sensors before deciding",
        isCorrect: false,
        explanation: "While checking sensors is good practice, with 80% rain probability, waiting is still the best choice.",
        points: 3
      }
    ],
    educationalTip: "Smart irrigation considers weather forecasts, soil moisture, and crop needs. Over-irrigation wastes water and can harm crops.",
    description: "Master water management for sustainable farming"
  },
  {
    id: "nutrient-deficiency",
    title: "Nutrient Deficiency Diagnosis",
    category: "nutrients",
    difficulty: "intermediate",
    icon: "🌿",
    scenario: "Your tomato plants show yellowing leaves starting from the bottom, with green veins remaining visible. The yellowing is spreading upward.",
    question: "What nutrient deficiency is most likely causing this symptom?",
    options: [
      {
        id: "nitrogen",
        text: "Nitrogen deficiency",
        isCorrect: true,
        explanation: "Nitrogen deficiency causes yellowing (chlorosis) starting from older leaves, with veins often remaining green initially.",
        points: 12
      },
      {
        id: "iron",
        text: "Iron deficiency",
        isCorrect: false,
        explanation: "Iron deficiency causes yellowing between veins but typically affects new growth first, not old leaves.",
        points: 0
      },
      {
        id: "magnesium",
        text: "Magnesium deficiency",
        isCorrect: false,
        explanation: "Magnesium deficiency causes yellowing between veins but usually affects older leaves differently than described.",
        points: 0
      },
      {
        id: "phosphorus",
        text: "Phosphorus deficiency",
        isCorrect: false,
        explanation: "Phosphorus deficiency typically causes dark green or purple leaves, not yellowing.",
        points: 0
      }
    ],
    educationalTip: "Nutrient deficiencies have specific symptoms. Nitrogen deficiency starts with older leaves turning yellow while veins stay green.",
    description: "Identify and treat nutrient deficiencies in crops"
  },
  {
    id: "pest-management",
    title: "Integrated Pest Management",
    category: "pests",
    difficulty: "advanced",
    icon: "🐛",
    scenario: "You notice aphids on your lettuce crop. The infestation is moderate but not severe. You have beneficial insects (ladybugs) in nearby areas.",
    question: "What's the best integrated pest management approach?",
    options: [
      {
        id: "biological",
        text: "Encourage ladybugs and use neem oil spray as backup",
        isCorrect: true,
        explanation: "Biological control (ladybugs) combined with organic sprays is the most sustainable approach for moderate infestations.",
        points: 20
      },
      {
        id: "chemical",
        text: "Apply chemical insecticide immediately",
        isCorrect: false,
        explanation: "Chemical insecticides kill beneficial insects too and should be a last resort for severe infestations only.",
        points: 0
      },
      {
        id: "wait",
        text: "Do nothing and wait for natural predators",
        isCorrect: false,
        explanation: "While beneficial insects help, moderate infestations may need intervention to prevent crop damage.",
        points: 5
      },
      {
        id: "remove",
        text: "Remove all affected plants immediately",
        isCorrect: false,
        explanation: "Removing plants for moderate aphid infestation is overkill and wastes the crop.",
        points: 0
      }
    ],
    educationalTip: "IPM uses multiple strategies: biological control, cultural practices, and targeted treatments. Start with least harmful methods.",
    description: "Learn sustainable pest control strategies"
  },
  {
    id: "weather-protection",
    title: "Weather Risk Management",
    category: "weather",
    difficulty: "intermediate",
    icon: "⛈️",
    scenario: "A severe thunderstorm with hail is forecast for tomorrow afternoon. Your corn is in the tasseling stage, and your tomatoes are flowering.",
    question: "What protective measures should you take?",
    options: [
      {
        id: "cover-tomatoes",
        text: "Cover tomatoes with row covers and harvest any mature corn",
        isCorrect: true,
        explanation: "Tomatoes are more vulnerable to hail damage during flowering. Corn at tasseling stage is more resilient, but harvesting mature ears protects yield.",
        points: 15
      },
      {
        id: "cover-both",
        text: "Cover both crops with protective materials",
        isCorrect: false,
        explanation: "While protective, corn at tasseling stage needs pollination, so covering might reduce yield more than hail damage.",
        points: 8
      },
      {
        id: "harvest-all",
        text: "Harvest everything possible before the storm",
        isCorrect: false,
        explanation: "Harvesting immature crops reduces quality and yield. Selective harvesting is better.",
        points: 5
      },
      {
        id: "do-nothing",
        text: "Do nothing - crops can handle some hail",
        isCorrect: false,
        explanation: "Hail can cause significant damage to flowering and fruiting crops. Some protection is better than none.",
        points: 0
      }
    ],
    educationalTip: "Different crops have different vulnerabilities to weather. Protect the most vulnerable crops and harvest what's ready.",
    description: "Protect crops from extreme weather events"
  },
  {
    id: "sustainable-rotation",
    title: "Crop Rotation Planning",
    category: "sustainability",
    difficulty: "advanced",
    icon: "🔄",
    scenario: "You're planning next year's crop rotation. This year you grew corn (heavy nitrogen user). You have options: soybeans, wheat, or potatoes.",
    question: "Which crop rotation is most sustainable for soil health?",
    options: [
      {
        id: "soybeans",
        text: "Plant soybeans to fix nitrogen and improve soil",
        isCorrect: true,
        explanation: "Soybeans are legumes that fix nitrogen from the air, replenishing soil nitrogen depleted by corn. This improves soil health and reduces fertilizer needs.",
        points: 18
      },
      {
        id: "wheat",
        text: "Plant wheat for a different crop family",
        isCorrect: false,
        explanation: "While wheat is a different family, it doesn't fix nitrogen. The soil will still be depleted of nitrogen.",
        points: 8
      },
      {
        id: "potatoes",
        text: "Plant potatoes for diversity",
        isCorrect: false,
        explanation: "Potatoes are heavy feeders like corn and would further deplete soil nutrients without adding benefits.",
        points: 3
      },
      {
        id: "corn-again",
        text: "Plant corn again - it's your most profitable crop",
        isCorrect: false,
        explanation: "Continuous corn depletes soil nutrients and increases pest/disease pressure. Rotation is essential for sustainability.",
        points: 0
      }
    ],
    educationalTip: "Crop rotation with nitrogen-fixing legumes improves soil health, reduces fertilizer needs, and breaks pest cycles.",
    description: "Plan sustainable crop rotations for long-term soil health"
  }
];

const CATEGORY_ICONS = {
  soil: "🌱",
  water: "💧",
  nutrients: "🌿",
  pests: "🐛",
  weather: "⛈️",
  sustainability: "🔄"
};

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  advanced: "bg-red-100 text-red-800 border-red-200"
};

export default function FarmChallenge() {
  const navigate = useNavigate();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentChallenge = CHALLENGES[currentChallengeIndex];
  const progress = ((currentChallengeIndex + 1) / CHALLENGES.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    setShowResult(true);
    const selectedAnswer = currentChallenge.options.find(opt => opt.id === selectedOption);
    
    if (selectedAnswer) {
      const newScore = score + selectedAnswer.points;
      setScore(newScore);
      
      if (selectedAnswer.isCorrect) {
        toast.success("Correct! 🎉", {
          description: `+${selectedAnswer.points} points earned`
        });
      } else {
        toast.error("Not quite right", {
          description: "But you learned something valuable!"
        });
      }
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < CHALLENGES.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Game completed
      setGameCompleted(true);
      setCompletedChallenges([...completedChallenges, currentChallenge.id]);
      
      // Award bonus points for completion
      const bonusPoints = Math.floor(score * 0.2); // 20% bonus
      const totalPoints = score + bonusPoints;
      addPoints(totalPoints);
      
      toast.success("Challenge Complete! 🏆", {
        description: `Total score: ${totalPoints} points (including ${bonusPoints} bonus)`
      });
    }
  };

  const handleRestart = () => {
    setCurrentChallengeIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setCompletedChallenges([]);
    setGameCompleted(false);
  };

  const getCategoryStats = () => {
    const stats = {
      soil: 0,
      water: 0,
      nutrients: 0,
      pests: 0,
      weather: 0,
      sustainability: 0
    };
    
    completedChallenges.forEach(challengeId => {
      const challenge = CHALLENGES.find(c => c.id === challengeId);
      if (challenge) {
        stats[challenge.category]++;
      }
    });
    
    return stats;
  };

  if (gameCompleted) {
    const categoryStats = getCategoryStats();
    const masteryLevel = score >= 80 ? "Expert" : score >= 60 ? "Advanced" : score >= 40 ? "Intermediate" : "Beginner";
    
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
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Challenge Complete!
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Congratulations on completing the Farm Challenge!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{score}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{masteryLevel}</div>
                  <div className="text-sm text-muted-foreground">Mastery Level</div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{CHALLENGES.length}</div>
                  <div className="text-sm text-muted-foreground">Challenges Completed</div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card mb-8">
              <CardHeader>
                <CardTitle>Knowledge Areas Covered</CardTitle>
                <CardDescription>Your learning progress across different farming topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <div key={category} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl mb-2">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</div>
                      <div className="font-semibold capitalize">{category}</div>
                      <div className="text-sm text-muted-foreground">{count} challenges</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} className="bg-gradient-primary">
                Play Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/rewards")}>
                View Rewards
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">Farm Challenge</h1>
              <p className="text-muted-foreground mt-1">Test your farming knowledge and earn points!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{currentChallengeIndex + 1} of {CHALLENGES.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card mb-6">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentChallenge.icon}</span>
                  <div>
                    <CardTitle className="text-xl">{currentChallenge.title}</CardTitle>
                    <CardDescription>{currentChallenge.description}</CardDescription>
                  </div>
                </div>
                <Badge className={DIFFICULTY_COLORS[currentChallenge.difficulty]}>
                  {currentChallenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Scenario
                </h4>
                <p className="text-muted-foreground">{currentChallenge.scenario}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {currentChallenge.question}
                </h4>
                
                <div className="space-y-3">
                  {currentChallenge.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const isCorrect = option.isCorrect;
                    const showCorrect = showResult && isCorrect;
                    const showIncorrect = showResult && isSelected && !isCorrect;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={showResult}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          isSelected
                            ? showCorrect
                              ? "border-green-500 bg-green-50"
                              : showIncorrect
                              ? "border-red-500 bg-red-50"
                              : "border-primary bg-primary/10"
                            : showResult && isCorrect
                            ? "border-green-300 bg-green-25"
                            : "border-border hover:border-primary/50"
                        } ${showResult ? "cursor-default" : "cursor-pointer hover:bg-muted/50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.text}</span>
                          {showResult && (
                            <span className="text-sm font-semibold">
                              {isCorrect ? "+" + option.points : "0"} pts
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showResult && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-3">
                      <div>
                        <strong>Explanation:</strong> {currentChallenge.options.find(opt => opt.id === selectedOption)?.explanation}
                      </div>
                      <div className="pt-3 border-t">
                        <strong>💡 Educational Tip:</strong> {currentChallenge.educationalTip}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                {!showResult ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="bg-gradient-primary"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-gradient-primary">
                    {currentChallengeIndex < CHALLENGES.length - 1 ? "Next Challenge" : "Complete Challenge"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
