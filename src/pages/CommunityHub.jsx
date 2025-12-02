import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

function CommunityHub() {
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [subscribedCommunities, setSubscribedCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [newPost, setNewPost] = useState({ content: '', category: 'Tips' });
  const [newComment, setNewComment] = useState({});
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isAdmin = localStorage.getItem('userId') === '1';
  const categories = selectedCommunity === '2' ? ['All', 'Hiring', 'For Hire'] : ['All', 'Tips', 'Finance', 'Productivity', 'Health', 'Other'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access Community Hub');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API_BASE_URL}/api/communities`, { headers }),
      axios.get(`${API_BASE_URL}/api/subscriptions`, { headers }),
    ])
      .then(([communitiesRes, subscriptionsRes]) => {
        setCommunities(communitiesRes.data);
        setSubscribedCommunities(subscriptionsRes.data.map(sub => sub.id));
      })
      .catch((err) => {
        console.error('Fetch error:', err.response?.data);
        setError(err.response?.data?.error || 'Error fetching data');
      });

    if (selectedCommunity) {
      fetchPosts(selectedCommunity);
    }
  }, [selectedCommunity]);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPosts = async (communityId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const postsRes = await axios.get(`${API_BASE_URL}/api/posts?community_id=${communityId}`, { headers });
      const postsWithComments = await Promise.all(postsRes.data.map(async (post) => {
        try {
          const commentsRes = await axios.get(`${API_BASE_URL}/api/comments?post_id=${post.id}`, { headers });
          return { ...post, comments: commentsRes.data || [] };
        } catch (commentErr) {
          console.error(`Error fetching comments for post ${post.id}:`, commentErr.response?.data);
          return { ...post, comments: [] };
        }
      }));
      setPosts(postsWithComments);
    } catch (err) {
      console.error('Error fetching posts:', err.response?.data);
      setError(err.response?.data?.error || 'Error fetching posts');
    }
  };

  const handleSelectCommunity = (communityId) => {
    setSelectedCommunity(communityId);
    setNewPost({ content: '', category: communityId === '2' ? 'Hiring' : 'Tips' });
    setFilterCategory('All');
    fetchPosts(communityId);
  };

  const handleSubscribe = async (communityId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (subscribedCommunities.includes(communityId)) {
        await axios.delete(`${API_BASE_URL}/api/subscriptions`, { data: { community_id: communityId }, headers });
        setSubscribedCommunities(subscribedCommunities.filter(id => id !== communityId));
        setCommunities(communities.map(c => c.id === communityId ? { ...c, subscribers: c.subscribers - 1, isSubscribed: false } : c));
        if (selectedCommunity === communityId) setSelectedCommunity(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/subscriptions`, { community_id: communityId }, { headers });
        setSubscribedCommunities([...subscribedCommunities, communityId]);
        setCommunities(communities.map(c => c.id === communityId ? { ...c, subscribers: c.subscribers + 1, isSubscribed: true } : c));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating subscription');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newCommunity.name || !newCommunity.description) {
      setError('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/communities`, newCommunity, { headers });
      setCommunities([...communities, { ...res.data, subscribers: 0, isSubscribed: false }]);
      setNewCommunity({ name: '', description: '' });
      setShowCreateCommunity(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating community');
    }
  };

  const handlePostChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.content || !selectedCommunity) {
      setError('Please enter a message');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to post');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    try {
      const formData = new FormData();
      formData.append('community_id', selectedCommunity);
      formData.append('content', newPost.content);
      formData.append('category', newPost.category);
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const res = await axios.post(`${API_BASE_URL}/api/posts`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([{ ...res.data, comments: [] }, ...posts]);
      setNewPost({ content: '', category: selectedCommunity === '2' ? 'Hiring' : 'Tips' });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError('');
    } catch (err) {
      console.error('Post submission error:', err.response?.data);
      setError(err.response?.data?.error || 'Error creating post');
    }
  };

  const handleVote = async (postId, type) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.post(`${API_BASE_URL}/api/posts/vote`, { post_id: postId, type }, { headers });
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, [type + 's']: post[type + 's'] + 1 } : post
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Error voting');
    }
  };

  const handleFlag = async (postId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.post(`${API_BASE_URL}/api/posts/flag`, { post_id: postId }, { headers });
      setPosts(posts.map(post => post.id === postId ? { ...post, flagged: 1 } : post));
    } catch (err) {
      setError(err.response?.data?.error || 'Error flagging post');
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/comments`, { post_id: postId, content: newComment[postId] }, { headers });
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, comments: [...(post.comments || []), res.data] } : post
      ));
      setNewComment({ ...newComment, [postId]: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding comment');
    }
  };

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith('http')) return mediaUrl;
    return `${API_BASE_URL}${mediaUrl.startsWith('/') ? '' : '/'}${mediaUrl}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts
    .filter(post => selectedCommunity && post.community_id === selectedCommunity)
    .filter(post => filterCategory === 'All' || post.category === filterCategory);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'Popular') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="text-text-primary h-screen flex">
      {/* Communities Sidebar */}
      <div className="w-80 bg-card-bg border-r border-card-border flex flex-col">
        <div className="p-4 border-b border-card-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text-primary">Communities</h3>
            {isAdmin && (
              <button
                onClick={() => setShowCreateCommunity(true)}
                className="bg-primary text-primary-text px-3 py-1 rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                + Create
              </button>
            )}
          </div>
          {error && <p className="text-error text-sm mb-2">{error}</p>}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
            placeholder="Search communities..."
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCommunities.length > 0 ? (
            <div>
              {filteredCommunities.map(community => (
                <div
                  key={community.id}
                  onClick={() => handleSelectCommunity(community.id)}
                  className={`p-4 border-b border-card-border cursor-pointer hover:bg-surface-elevated ${
                    selectedCommunity === community.id ? 'bg-surface-elevated' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">{community.name}</p>
                      <p className="text-sm text-text-muted truncate">{community.description}</p>
                      <p className="text-xs text-text-muted mt-1">{community.subscribers} members</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(community.id);
                      }}
                      className={`ml-2 px-3 py-1 rounded text-sm ${
                        subscribedCommunities.includes(community.id)
                          ? 'bg-error text-error-text hover:bg-error-hover'
                          : 'bg-primary text-primary-text hover:bg-primary-hover'
                      }`}
                    >
                      {subscribedCommunities.includes(community.id) ? 'Leave' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-text-muted">
              <p>No communities found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card-bg">
        {selectedCommunity ? (
          <>
            {/* Community Header */}
            <div className="p-4 border-b border-card-border">
              <h3 className="text-xl font-bold text-text-primary">
                {communities.find(c => c.id === selectedCommunity)?.name || 'Community'}
              </h3>
              <p className="text-sm text-text-muted">
                {communities.find(c => c.id === selectedCommunity)?.description || ''}
              </p>
              <div className="flex space-x-4 mt-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 text-sm"
                >
                  <option value="Recent">Recent</option>
                  <option value="Popular">Popular</option>
                </select>
              </div>
            </div>

            {/* Messages/Posts Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sortedPosts.length > 0 ? (
                sortedPosts.map((post, index) => {
                  const showDate = index === 0 || 
                    new Date(post.date).toDateString() !== 
                    new Date(sortedPosts[index - 1].date).toDateString();

                  return (
                    <div key={post.id}>
                      {showDate && (
                        <div className="text-center text-text-muted text-sm my-4">
                          {formatDate(post.date)}
                        </div>
                      )}
                      <div className="bg-surface-elevated border border-border p-4 rounded-lg">
                        <div className="flex items-start space-x-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-bold text-text-primary">{post.author}</p>
                              <p className="text-xs text-text-muted">{formatTime(post.date)}</p>
                              <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded">{post.category}</span>
                            </div>
                            {post.title && post.title !== 'Untitled' && (
                              <p className="font-semibold text-text-primary mb-2">{post.title}</p>
                            )}
                            <p className="text-text-primary whitespace-pre-wrap mb-2">{post.content}</p>
                            {post.media && (
                              <div className="mt-2 mb-2">
                                <img
                                  src={getMediaUrl(post.media)}
                                  alt="Post media"
                                  className="max-w-md rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <button
                                onClick={() => handleVote(post.id, 'upvote')}
                                className="text-success hover:text-success-hover transition-colors text-sm"
                              >
                                ▲ {post.upvotes}
                              </button>
                              <button
                                onClick={() => handleVote(post.id, 'downvote')}
                                className="text-error hover:text-error-hover transition-colors text-sm"
                              >
                                ▼ {post.downvotes}
                              </button>
                              <button
                                onClick={() => handleFlag(post.id)}
                                className={`text-warning hover:text-warning-hover transition-colors text-sm ${post.flagged ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={post.flagged}
                              >
                                ⚑ {post.flagged ? 'Flagged' : 'Flag'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-sm font-bold mb-2 text-text-primary">Comments</h4>
                          {(post.comments || []).length > 0 && (
                            <div className="space-y-2 mb-2">
                              {(post.comments || []).map(comment => (
                                <div key={comment.id} className="bg-bg-secondary border border-border p-2 rounded-lg">
                                  <p className="text-xs text-text-muted mb-1">
                                    {comment.author} • {formatTime(comment.date)}
                                  </p>
                                  <p className="text-text-primary text-sm">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                              className="flex-1 p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder text-sm"
                              placeholder="Add a comment..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(post.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-text-muted py-8">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Post Input (Telegram-style at bottom) */}
            {subscribedCommunities.includes(selectedCommunity) && (
              <form onSubmit={handleSubmitPost} className="p-4 border-t border-card-border">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-elevated text-text-primary p-2 rounded-lg hover:bg-surface-elevated/80"
                  >
                    📎
                  </button>
                  {selectedFile && (
                    <span className="text-sm text-text-muted">{selectedFile.name}</span>
                  )}
                  <select
                    name="category"
                    value={newPost.category}
                    onChange={handlePostChange}
                    className="p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 text-sm"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="content"
                    value={newPost.content}
                    onChange={handlePostChange}
                    className="flex-1 p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <p className="text-xl mb-2">Select a community to start</p>
              <p className="text-sm">Join communities to share and discuss!</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Create Community</h3>
            <form onSubmit={handleCreateCommunity}>
              <div className="mb-4">
                <label htmlFor="community-name" className="block text-sm text-text-muted mb-2">Name</label>
                <input
                  type="text"
                  id="community-name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                  placeholder="Community name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="community-description" className="block text-sm text-text-muted mb-2">Description</label>
                <textarea
                  id="community-description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                  rows="3"
                  placeholder="Community description"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCommunity(false);
                    setNewCommunity({ name: '', description: '' });
                  }}
                  className="flex-1 bg-surface-elevated text-text-primary py-2 rounded-lg hover:bg-surface-elevated/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-text py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityHub;
