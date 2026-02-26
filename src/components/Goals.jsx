import { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../api/goalsApi";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch goals on mount
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getGoals();
        setGoals(data);
      } catch (err) {
        setError("Failed to load goals");
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  // Add a new goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || !category || !user?._id) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        targetAmount: Number(targetAmount),
        category,
        user: user._id,
        ...(deadline && { deadline }),
        ...(description && { description }),
      };
      const created = await createGoal(payload);
      setGoals([...goals, created.goal || created]);
      setTitle("");
      setTargetAmount("");
      setCategory("");
      setDeadline("");
      setDescription("");
    } catch (err) {
      setError("Failed to add goal");
    } finally {
      setLoading(false);
    }
  };

  // Toggle goal completion
  const handleToggleGoal = async (id) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setLoading(true);
    setError("");
    try {
      const updated = await updateGoal(id, { ...goal, completed: !goal.completed });
      setGoals(goals.map((g) => g.id === id ? (updated.goal || updated) : g));
    } catch (err) {
      setError("Failed to update goal");
    } finally {
      setLoading(false);
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      setError("Failed to delete goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal Title*"
              disabled={loading}
              required
            />
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Target Amount*"
              disabled={loading}
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-2 py-1"
              disabled={loading}
              required
            >
              <option value="">Select Category*</option>
              <option value="Savings">Savings</option>
              <option value="Investment">Investment</option>
              <option value="Purchase">Purchase</option>
              <option value="Travel">Travel</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Deadline"
              disabled={loading}
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="md:col-span-2">Add Goal</Button>
          </form>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li
                key={goal._id || goal.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="flex-1 font-semibold">{goal.title}</span>
                <span className="ml-2 text-sm text-gray-500">{goal.category}</span>
                <span className="ml-2 text-sm text-gray-500">Target: {goal.targetAmount}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleDeleteGoal(goal._id || goal.id)}
                  title="Delete goal"
                  disabled={loading}
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
