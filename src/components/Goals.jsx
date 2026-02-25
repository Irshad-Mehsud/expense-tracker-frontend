
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function Goals() {
  const [goals, setGoals] = useState([
    { id: 1, text: "Save $1000 emergency fund", completed: false },
    { id: 2, text: "Pay off credit card debt", completed: false },
  ]);
  const [newGoal, setNewGoal] = useState("");

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setGoals([
      ...goals,
      { id: Date.now(), text: newGoal.trim(), completed: false },
    ]);
    setNewGoal("");
  };

  const toggleGoal = (id) => {
    setGoals(goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addGoal} className="flex gap-2 mb-4">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new goal..."
            />
            <Button type="submit">Add</Button>
          </form>
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 ${goal.completed ? "line-through text-muted-foreground" : ""}`}
              >
                <span
                  className="cursor-pointer flex-1"
                  onClick={() => toggleGoal(goal.id)}
                  title="Toggle complete"
                >
                  {goal.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => deleteGoal(goal.id)}
                  title="Delete goal"
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
