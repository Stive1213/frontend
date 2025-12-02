import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { Card, Input, Button, LoadingSpinner } from '../components/ui';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await searchAPI.search(query);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const ResultSection = ({ title, items, type }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:bg-surface-hover transition-colors"
              onClick={() => {
                if (type === 'task') navigate(`/tasks-goals`);
                else if (type === 'goal') navigate(`/tasks-goals`);
                else if (type === 'habit') navigate(`/habits`);
                else if (type === 'journal') navigate(`/journal`);
                else if (type === 'document') navigate(`/documents`);
                else if (type === 'event') navigate(`/calendar`);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-text-primary">{item.title || item.name || item.original_filename}</h4>
                  {item.category && (
                    <p className="text-sm text-text-muted mt-1">Category: {item.category}</p>
                  )}
                  {item.deadline && (
                    <p className="text-sm text-text-muted mt-1">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
                  )}
                  {item.date && (
                    <p className="text-sm text-text-muted mt-1">Date: {new Date(item.date).toLocaleDateString()}</p>
                  )}
                  {item.text && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{item.text.substring(0, 100)}...</p>
                  )}
                </div>
                {item.isDone !== undefined && (
                  <span className={`px-2 py-1 rounded text-xs ${item.isDone ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {item.isDone ? 'Done' : 'Pending'}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="text-text-primary">
      <h2 className="text-2xl font-bold mb-6">Search</h2>

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, goals, habits, journal, documents, events..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 p-4 bg-error/10 border-error">
          <p className="text-error">{error}</p>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {results && !loading && (
        <div>
          {results.tasks?.length === 0 &&
            results.goals?.length === 0 &&
            results.habits?.length === 0 &&
            results.journal?.length === 0 &&
            results.documents?.length === 0 &&
            results.events?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-text-muted">No results found for "{query}"</p>
            </Card>
          ) : (
            <>
              <ResultSection title="Tasks" items={results.tasks} type="task" />
              <ResultSection title="Goals" items={results.goals} type="goal" />
              <ResultSection title="Habits" items={results.habits} type="habit" />
              <ResultSection title="Journal Entries" items={results.journal} type="journal" />
              <ResultSection title="Documents" items={results.documents} type="document" />
              <ResultSection title="Events" items={results.events} type="event" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;

