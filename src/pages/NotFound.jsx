import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Card className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-text-muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link to="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" className="w-full">Go to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFound;

