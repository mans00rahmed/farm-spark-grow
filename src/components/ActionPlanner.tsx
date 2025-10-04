import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Action } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface ActionPlannerProps {
  onActionsChange: (actions: Action[]) => void;
  dateRange: { from: string; to: string };
}

export default function ActionPlanner({ onActionsChange, dateRange }: ActionPlannerProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [newAction, setNewAction] = useState<Partial<Action>>({
    date: dateRange.from,
    type: "irrigate",
    amount: 0
  });

  const addAction = () => {
    if (newAction.date && newAction.type && newAction.amount) {
      const updated = [...actions, newAction as Action];
      setActions(updated);
      onActionsChange(updated);
      setNewAction({
        date: dateRange.from,
        type: "irrigate",
        amount: 0
      });
    }
  };

  const removeAction = (index: number) => {
    const updated = actions.filter((_, i) => i !== index);
    setActions(updated);
    onActionsChange(updated);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Plan Actions</CardTitle>
        <CardDescription>Schedule irrigation and fertilization events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="action-date">Date</Label>
            <Input
              id="action-date"
              type="date"
              value={newAction.date}
              min={dateRange.from}
              max={dateRange.to}
              onChange={(e) => setNewAction({ ...newAction, date: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type</Label>
            <Select
              value={newAction.type}
              onValueChange={(value: "irrigate" | "fertilize") => 
                setNewAction({ ...newAction, type: value })
              }
            >
              <SelectTrigger id="action-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="irrigate">Irrigate</SelectItem>
                <SelectItem value="fertilize">Fertilize</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="action-amount">
              Amount {newAction.type === "irrigate" ? "(mm)" : "(kg/ha)"}
            </Label>
            <Input
              id="action-amount"
              type="number"
              min="0"
              value={newAction.amount || ""}
              onChange={(e) => setNewAction({ ...newAction, amount: parseFloat(e.target.value) })}
            />
          </div>
          
          <Button onClick={addAction} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>

        {actions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Scheduled Actions ({actions.length})</h4>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{action.date}</span>
                    <span className="capitalize">{action.type}</span>
                    <span className="text-muted-foreground">
                      {action.amount} {action.type === "irrigate" ? "mm" : "kg/ha"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
