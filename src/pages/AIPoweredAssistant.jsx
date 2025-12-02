import { useState, useEffect } from 'react';

function AIPoweredAssistant() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token')); // Assuming token is stored in localStorage after login

  // Fetch assistant response from backend
  const getAssistantResponse = async (input) => {
    try {
      const response = await fetch('http://localhost:5000/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question: input }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        // Show the actual error message from backend
        const errorMsg = data.error || data.message || 'Failed to get response';
        console.error('Backend error:', errorMsg, data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      // Return the actual error message instead of generic one
      const errorMessage = error.message || 'Sorry, something went wrong. Please try again later.';
      throw new Error(errorMessage);
    }
  };

  // Handle user input submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: userInput };
    const inputText = userInput;
    setMessages([...messages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessageId = Date.now();
    setMessages((prev) => [...prev, { sender: 'assistant', text: 'Thinking...', id: loadingMessageId, isLoading: true }]);

    try {
      const { response, tips, actionableItems } = await getAssistantResponse(inputText);
      setMessages((prev) => {
        // Remove loading message and add actual response
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        const newMessages = [
          ...filtered,
          { 
            sender: 'assistant', 
            text: response,
            actionableItems: actionableItems || null,
            messageId: Date.now()
          },
          ...(tips.map(tip => ({ sender: 'assistant', text: `Tip: ${tip}` }))),
        ];
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        // Show the actual error message
        const errorText = error.message || 'Sorry, I encountered an error. Please try again.';
        return [...filtered, { sender: 'assistant', text: `Error: ${errorText}` }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Save AI-generated items
  const handleSaveItems = async (items, messageId) => {
    if (!items || Object.keys(items).length === 0) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/assistant/save-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the message to show success
        setMessages((prev) => 
          prev.map(msg => 
            msg.messageId === messageId 
              ? { ...msg, itemsSaved: true, saveResult: data }
              : msg
          )
        );
        
        // Show success message
        alert(`Success! ${data.message}`);
      } else {
        throw new Error(data.error || 'Failed to save items');
      }
    } catch (error) {
      console.error('Error saving items:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="text-white flex space-x-6">
      {/* Chat Box */}
      <div className="flex-1 bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Life Assistant Chat</h3>
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-slate-700 rounded-lg">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`mb-4 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-600 text-gray-200'
                  } ${message.isLoading ? 'opacity-70' : ''}`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">●</div>
                      <p>{message.text}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      {message.actionableItems && !message.itemsSaved && (
                        <div className="mt-3 pt-3 border-t border-slate-500">
                          <p className="text-sm font-semibold mb-2">AI Suggestions:</p>
                          {message.actionableItems.tasks && message.actionableItems.tasks.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-300 mb-1">Tasks ({message.actionableItems.tasks.length}):</p>
                              <ul className="text-xs text-slate-400 list-disc list-inside">
                                {message.actionableItems.tasks.map((task, idx) => (
                                  <li key={idx}>{task.title} {task.deadline && `(Due: ${task.deadline})`}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {message.actionableItems.habits && message.actionableItems.habits.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-300 mb-1">Habits ({message.actionableItems.habits.length}):</p>
                              <ul className="text-xs text-slate-400 list-disc list-inside">
                                {message.actionableItems.habits.map((habit, idx) => (
                                  <li key={idx}>{habit.name} ({habit.frequency})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {message.actionableItems.goals && message.actionableItems.goals.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-300 mb-1">Goals ({message.actionableItems.goals.length}):</p>
                              <ul className="text-xs text-slate-400 list-disc list-inside">
                                {message.actionableItems.goals.map((goal, idx) => (
                                  <li key={idx}>{goal.title}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => handleSaveItems(message.actionableItems, message.messageId)}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                          >
                            ✓ Save All to My Account
                          </button>
                        </div>
                      )}
                      {message.itemsSaved && (
                        <div className="mt-3 pt-3 border-t border-green-500">
                          <p className="text-sm text-green-400">✓ Items saved successfully!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Ask me anything about your data! For example, "What should I do about my expenses?" or "Tell me about my tasks today"</p>
          )}
        </div>
        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-purple-500"
            placeholder="Type your question (e.g., 'What should I do about my expenses?')"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Tips Section (Optional, can be removed since tips are now in chat) */}
      <div className="w-80 bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Life Tips</h3>
        <p className="text-gray-400">Ask me a question to get personalized tips!</p>
      </div>
    </div>
  );
}

export default AIPoweredAssistant;