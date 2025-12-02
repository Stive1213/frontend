import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';

function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 4;

  const steps = [
    {
      title: 'Welcome to LifeHub!',
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-text-muted mb-4">
            LifeHub is your all-in-one productivity and life management platform.
            Let's get you started!
          </p>
        </div>
      ),
    },
    {
      title: 'Manage Your Tasks & Goals',
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-text-muted mb-4">
            Create tasks, set goals, and track your progress. Stay organized and achieve more!
          </p>
        </div>
      ),
    },
    {
      title: 'Track Your Budget & Habits',
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-text-muted mb-4">
            Monitor your expenses, build healthy habits, and take control of your finances.
          </p>
        </div>
      ),
    },
    {
      title: 'Connect & Grow',
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-text-muted mb-4">
            Join communities, track your wellness, journal your thoughts, and earn points as you progress!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-2xl">
        <div className="mb-6">
          {/* Progress Bar */}
          <div className="w-full bg-surface-elevated rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="text-center mb-2">
            <span className="text-sm text-text-muted">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        <div className="mb-8 min-h-[300px] flex items-center justify-center">
          {steps[step - 1].content}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text-primary text-center mb-6">
            {steps[step - 1].title}
          </h2>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {step === totalSteps ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Onboarding;

