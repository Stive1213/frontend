import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input, Alert } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

function TasksGoals() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    category: 'Work',
    subtasks: [],
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [filter, setFilter] = useState('All');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: '',
    deadline: '',
    progress: 0,
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [error, setError] = useState('');

  // Fetch tasks and goals on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view tasks and goals');
      return;
    }

    // Fetch tasks
    axios
      .get(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTasks(response.data))
      .catch((err) => setError(err.response?.data?.error || 'Error fetching tasks'));

    // Fetch goals
    axios
      .get(`${API_BASE_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setGoals(response.data))
      .catch((err) => setError(err.response?.data?.error || 'Error fetching goals'));
  }, []);

  // Handle Task Form
  const handleTaskChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setNewTask({ ...newTask, subtasks: [...newTask.subtasks, newSubtask] });
      setNewSubtask('');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/tasks`,
        { ...newTask, isDone: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', deadline: '', category: 'Work', subtasks: [] });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding task');
    }
  };

  const toggleTaskDone = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        { isDone: !task.isDone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, isDone: !t.isDone } : t)));
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const today = new Date(new Date()); // Replace with dynamic date later
    const deadline = new Date(task.deadline);
    if (filter === 'Due Today') {
      return deadline.toDateString() === today.toDateString();
    } else if (filter === 'Overdue') {
      return deadline < today && !task.isDone;
    }
    return true;
  });

  // Handle Goal Form
  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    if (editingGoal) {
      setEditingGoal({ ...editingGoal, [name]: value });
    } else {
      setNewGoal({ ...newGoal, [name]: value });
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/goals`,
        { ...newGoal, progress: parseInt(newGoal.progress) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals([...goals, response.data]);
      setNewGoal({ title: '', target: '', deadline: '', progress: 0 });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding goal');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal.title || !editingGoal.target || !editingGoal.deadline) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_BASE_URL}/api/goals/${editingGoal.id}`,
        { ...editingGoal, progress: parseInt(editingGoal.progress) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(goals.map((g) => (g.id === editingGoal.id ? { ...editingGoal, progress: parseInt(editingGoal.progress) } : g)));
      setEditingGoal(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating goal');
    }
  };

  return (
    <div className="text-text-primary animate-fade-in">
      <h2 className="text-2xl text-text-primary font-bold mb-6 animate-fade-in-down">Tasks & Goals</h2>
      <Alert type="error" message={error} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Section */}
        <Card stagger={1}>
          <h3 className="text-xl font-bold mb-4 text-text-primary">Tasks</h3>
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                id="task-title"
                name="title"
                label="Title"
                value={newTask.title}
                onChange={handleTaskChange}
                placeholder="Enter task title"
                stagger={1}
                animated={false}
              />
              <Input
                type="date"
                id="task-deadline"
                name="deadline"
                label="Deadline"
                value={newTask.deadline}
                onChange={handleTaskChange}
                stagger={2}
                animated={false}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="task-category" className="block text-sm text-text-muted mb-2">
                Category
              </label>
              <select
                id="task-category"
                name="category"
                value={newTask.category}
                onChange={handleTaskChange}
                className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 transition-apple"
              >
                <option value="Work">Work</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-text-muted mb-2">Subtasks</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 transition-apple"
                  placeholder="Add a subtask"
                />
                <Button
                  type="button"
                  onClick={addSubtask}
                  size="sm"
                  animated={false}
                >
                  Add
                </Button>
              </div>
              <ul className="mt-2">
                {newTask.subtasks.map((subtask, index) => (
                  <li key={index} className="text-sm text-text-muted">
                    - {subtask}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              type="submit"
              fullWidth
              animated={false}
            >
              Add Task
            </Button>
          </form>
          <div className="flex space-x-2 mb-4">
            {['All', 'Due Today', 'Overdue'].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? 'primary' : 'ghost'}
                size="sm"
                animated={false}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-divider">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Deadline</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t border-divider">
                    <td className="py-2 text-text-primary">
                      <div>
                        <p>{task.title}</p>
                        {task.subtasks.length > 0 && (
                          <ul className="text-xs text-text-muted">
                            {task.subtasks.map((subtask, index) => (
                              <li key={index}>- {subtask}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-text-primary">{task.deadline}</td>
                    <td className="py-2 text-text-primary">{task.category}</td>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={task.isDone}
                        onChange={() => toggleTaskDone(task.id)}
                        className="accent-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Goal Section */}
        <Card stagger={2}>
          <h3 className="text-xl font-bold mb-4 text-text-primary">Goals</h3>
          <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                id="goal-title"
                name="title"
                label="Title"
                value={editingGoal ? editingGoal.title : newGoal.title}
                onChange={handleGoalChange}
                placeholder="Enter goal title"
                stagger={1}
                animated={false}
              />
              <Input
                type="text"
                id="goal-target"
                name="target"
                label="Target"
                value={editingGoal ? editingGoal.target : newGoal.target}
                onChange={handleGoalChange}
                placeholder="e.g., Save 5,000 ETB"
                stagger={2}
                animated={false}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                type="date"
                id="goal-deadline"
                name="deadline"
                label="Deadline"
                value={editingGoal ? editingGoal.deadline : newGoal.deadline}
                onChange={handleGoalChange}
                stagger={3}
                animated={false}
              />
              <Input
                type="number"
                id="goal-progress"
                name="progress"
                label="Progress (%)"
                value={editingGoal ? editingGoal.progress : newGoal.progress}
                onChange={handleGoalChange}
                min="0"
                max="100"
                placeholder="0-100"
                stagger={4}
                animated={false}
              />
            </div>
            <Button
              type="submit"
              fullWidth
              animated={false}
            >
              {editingGoal ? 'Update Goal' : 'Add Goal'}
            </Button>
            {editingGoal && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingGoal(null)}
                fullWidth
                className="mt-2"
                animated={false}
              >
                Cancel
              </Button>
            )}
          </form>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={goal.id} className="bg-surface-elevated border border-border p-4 rounded-lg hover-lift transition-smooth animate-fade-in-scale stagger-1">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-bold text-text-primary">{goal.title}</h4>
                  <Button
                    onClick={() => handleEditGoal(goal)}
                    variant="ghost"
                    size="sm"
                    animated={false}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-text-muted">{goal.target}</p>
                <p className="text-sm text-text-muted">Deadline: {goal.deadline}</p>
                <div className="mt-2">
                  <div className="w-full bg-bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-muted mt-1">{goal.progress}% Complete</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TasksGoals;