import { useState, useEffect, useRef } from 'react';
import { chatAPI, profilePicturesAPI } from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import ProfilePictureGallery from '../components/ProfilePictureGallery';

function SocialCircle() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showProfileGallery, setShowProfileGallery] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketRef.current = connectSocket(token);
      setupSocketListeners();
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, []);

  // Setup socket event listeners
  const setupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    // Remove existing listeners to avoid duplicates
    socket.off('new-message');
    socket.off('message-received');
    socket.off('user-typing');
    socket.off('messages-read');

    socket.on('new-message', (message) => {
      if (message.conversation_id === selectedConversation?.id) {
        setMessages((prev) => {
          // Check if message already exists by ID
          const existsById = prev.some(m => m.id === message.id);
          if (existsById) {
            // Message already exists, just update it
            return prev.map(m => m.id === message.id ? message : m);
          }
          
          // Check if server echoed back the tempId
          if (message.tempId) {
            const matchingTempMessage = prev.find(m => m.tempId === message.tempId);
            if (matchingTempMessage) {
              // Replace optimistic message with real one
              return prev.map(m => 
                m.tempId === message.tempId ? { ...message, tempId: undefined } : m
              );
            }
          }
          
          // Check if this matches an optimistic message (same sender, same content, within last 5 seconds)
          // This handles cases where server doesn't echo tempId
          const now = new Date();
          const messageTime = new Date(message.created_at);
          const timeDiff = Math.abs(now - messageTime) / 1000; // seconds
          
          const matchingTempMessage = prev.find(m => 
            m.tempId && 
            m.sender_id === message.sender_id && 
            m.content === message.content &&
            timeDiff < 5 // within 5 seconds
          );
          
          if (matchingTempMessage) {
            // Replace optimistic message with real one
            return prev.map(m => 
              m.tempId === matchingTempMessage.tempId ? message : m
            );
          }
          
          // New message, add it
          return [...prev, message];
        });
        scrollToBottom();
      }
      // Update conversations list
      loadConversations();
    });

    socket.on('message-received', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        loadMessages(selectedConversation.id);
      }
      loadConversations();
    });

    socket.on('user-typing', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.userId !== data.userId);
          return data.isTyping ? [...filtered, data] : filtered;
        });
      }
    });

    socket.on('messages-read', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        loadMessages(selectedConversation.id);
      }
    });
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      joinConversationRoom(selectedConversation.id);
      markAsRead(selectedConversation.id);
      // Re-setup socket listeners when conversation changes
      setupSocketListeners();
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await chatAPI.searchUsers(query);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const startConversation = async (userId) => {
    try {
      setLoading(true);
      const response = await chatAPI.getOrCreateConversation(userId);
      const conversation = response.data;
      
      // Find or add to conversations list
      const existingIndex = conversations.findIndex((c) => c.id === conversation.id);
      if (existingIndex >= 0) {
        setSelectedConversation(conversations[existingIndex]);
      } else {
        await loadConversations();
        setSelectedConversation(conversation);
      }
      
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const joinConversationRoom = (conversationId) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await chatAPI.markAsRead(conversationId);
      const socket = getSocket();
      if (socket) {
        socket.emit('mark-read', { conversationId });
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;
    if (!selectedConversation) return;

    const formData = new FormData();
    formData.append('conversationId', selectedConversation.id);
    formData.append('content', messageInput);
    
    const file = selectedFile || fileInputRef.current?.files[0];
    const messageContent = messageInput;
    const messageType = file ? (file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file') : 'text';

    // Create optimistic message for immediate UI update with preview
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: null,
      tempId: tempId,
      conversation_id: selectedConversation.id,
      sender_id: currentUser?.id,
      sender_name: currentUser?.firstName && currentUser?.lastName 
        ? `${currentUser.firstName} ${currentUser.lastName}` 
        : currentUser?.username,
      sender_username: currentUser?.username,
      content: messageContent,
      message_type: messageType,
      media_url: imagePreview || null, // Use preview URL temporarily
      media_type: file?.type || null,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    // Clear input and preview immediately
    setMessageInput('');
    clearFileSelection();

    try {
      // If there's a file, upload it first via HTTP
      if (file) {
        formData.append('media', file);
        const uploadResponse = await chatAPI.sendMessage(formData);
        
        // Update optimistic message with real media URL
        setMessages((prev) => prev.map(m => 
          m.tempId === tempId 
            ? { 
                ...m, 
                media_url: uploadResponse.data.media_url, 
                message_type: messageType,
                media_type: uploadResponse.data.media_type
              }
            : m
        ));

        // Send via WebSocket for real-time delivery
        const socket = getSocket();
        if (socket) {
          const messageData = {
            conversationId: selectedConversation.id,
            content: messageContent,
            messageType: messageType,
            mediaUrl: uploadResponse.data.media_url,
            mediaType: uploadResponse.data.media_type,
            fileName: uploadResponse.data.file_name,
            fileSize: uploadResponse.data.file_size,
            tempId: tempId,
          };
          socket.emit('send-message', messageData);
        }
      } else {
        // Text-only message
        const socket = getSocket();
        if (socket) {
          const messageData = {
            conversationId: selectedConversation.id,
            content: messageContent,
            messageType: 'text',
            tempId: tempId,
          };
          socket.emit('send-message', messageData);
        } else {
          // Fallback to HTTP if WebSocket is not available
          const response = await chatAPI.sendMessage(formData);
          if (response.data) {
            setMessages((prev) => prev.map(m => 
              m.tempId === tempId ? response.data : m
            ));
          }
          loadMessages(selectedConversation.id);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.tempId !== tempId));
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('typing', {
        conversationId: selectedConversation.id,
        isTyping: true,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          conversationId: selectedConversation.id,
          isTyping: false,
        });
      }, 3000);
    }
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

  const getOtherUser = (conversation) => {
    if (!conversation || !currentUser) return null;
    
    // Construct full image URL if it's a relative path
    let imageUrl = conversation.other_user_image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('https://via.placeholder.com')) {
      imageUrl = imageUrl.startsWith('/') 
        ? `${API_BASE_URL}${imageUrl}` 
        : `${API_BASE_URL}/${imageUrl}`;
    }
    
    return {
      id: conversation.other_user_id,
      username: conversation.other_username || 'Unknown',
      name: conversation.other_user_name || conversation.other_username || 'Unknown',
      image: imageUrl || 'https://via.placeholder.com/40',
    };
  };

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
    // Ensure proper path construction - mediaUrl should already start with /uploads/...
    const cleanPath = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  return (
    <div className="text-text-primary h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-card-bg border-r border-card-border flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-card-border">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
            placeholder="Search by username or phone..."
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-card-bg border border-card-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="p-3 hover:bg-surface-elevated cursor-pointer flex items-center space-x-3"
                >
                  <img
                    src={
                      user.profile_image && !user.profile_image.startsWith('http') && !user.profile_image.startsWith('https://via.placeholder.com')
                        ? (user.profile_image.startsWith('/') ? `${API_BASE_URL}${user.profile_image}` : `${API_BASE_URL}/${user.profile_image}`)
                        : (user.profile_image || 'https://via.placeholder.com/40')
                    }
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div>
                    <p className="font-medium text-text-primary">{user.username}</p>
                    <p className="text-sm text-text-muted">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div>
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                if (!otherUser) return null;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-card-border cursor-pointer hover:bg-surface-elevated ${
                      selectedConversation?.id === conversation.id ? 'bg-surface-elevated' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={otherUser.image || 'https://via.placeholder.com/50'}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full cursor-pointer object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(otherUser.id);
                            setShowProfileGallery(true);
                          }}
                        />
                        {conversation.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error text-error-text text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{otherUser.username}</p>
                        <p className="text-sm text-text-muted truncate">{otherUser.name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-text-muted">
              <p>No conversations yet.</p>
              <p className="text-sm mt-2">Search for users to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card-bg">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-card-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={getOtherUser(selectedConversation)?.image || 'https://via.placeholder.com/40'}
                  alt={getOtherUser(selectedConversation)?.username}
                  className="w-10 h-10 rounded-full cursor-pointer object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40';
                  }}
                  onClick={() => {
                    setSelectedUserId(getOtherUser(selectedConversation)?.id);
                    setShowProfileGallery(true);
                  }}
                />
                <div>
                  <p className="font-medium text-text-primary">
                    {getOtherUser(selectedConversation)?.username}
                  </p>
                  <p className="text-sm text-text-muted">
                    {getOtherUser(selectedConversation)?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === currentUser?.id;
                const showDate = index === 0 || 
                  new Date(message.created_at).toDateString() !== 
                  new Date(messages[index - 1].created_at).toDateString();

                // Determine if message has content to display
                const hasText = message.content && message.content.trim();
                const hasImage = (message.message_type === 'image' || (message.media_url && message.media_type?.startsWith('image/'))) && message.media_url;
                const hasVideo = message.message_type === 'video' && message.media_url;
                const hasAudio = message.message_type === 'audio' && message.media_url;
                const hasFile = message.message_type === 'file' && message.media_url;
                const hasContent = hasText || hasImage || hasVideo || hasAudio || hasFile;

                // Skip rendering if message has no content (shouldn't happen, but safety check)
                if (!hasContent && !message.tempId) {
                  return null;
                }

                return (
                  <div key={message.id || message.tempId}>
                    {showDate && (
                      <div className="text-center text-text-muted text-sm my-4">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md p-3 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-text'
                            : 'bg-surface-elevated text-text-primary'
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-80">
                            {message.sender_name || message.sender_username}
                          </p>
                        )}
                        
                        {/* Message Content */}
                        {/* Show text content if it exists */}
                        {message.content && message.content.trim() && (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        
                        {/* Show image if media_url exists and message_type is image */}
                        {(message.message_type === 'image' || (message.media_url && message.media_type?.startsWith('image/'))) && message.media_url && (
                          <div className={message.content && message.content.trim() ? "mt-2" : ""}>
                            <img
                              src={message.media_url.startsWith('data:') ? message.media_url : getMediaUrl(message.media_url)}
                              alt="Shared image"
                              className="max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                console.error('Failed to load image:', {
                                  media_url: message.media_url,
                                  full_url: message.media_url.startsWith('data:') ? 'data URL' : getMediaUrl(message.media_url),
                                  message_type: message.message_type,
                                  media_type: message.media_type
                                });
                                if (!message.media_url.startsWith('data:')) {
                                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+not+found';
                                  e.target.className = 'max-w-md rounded-lg opacity-50';
                                }
                              }}
                              onClick={() => {
                                if (!message.media_url.startsWith('data:')) {
                                  const url = getMediaUrl(message.media_url);
                                  if (url) window.open(url, '_blank');
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        {message.message_type === 'video' && (
                          <video
                            src={getMediaUrl(message.media_url)}
                            controls
                            className="max-w-full rounded-lg"
                          />
                        )}
                        
                        {message.message_type === 'audio' && (
                          <audio
                            src={getMediaUrl(message.media_url)}
                            controls
                            className="w-full"
                          />
                        )}
                        
                        {message.message_type === 'file' && (
                          <a
                            href={getMediaUrl(message.media_url)}
                            download={message.file_name}
                            className="flex items-center space-x-2 hover:underline"
                          >
                            <span>📎</span>
                            <span>{message.file_name}</span>
                          </a>
                        )}

                        <p className={`text-xs mt-1 ${isOwn ? 'opacity-80' : 'text-text-muted'}`}>
                          {formatTime(message.created_at)}
                          {isOwn && message.read_at && ' ✓✓'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-surface-elevated p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-card-border">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearFileSelection}
                    className="absolute top-1 right-1 bg-error text-error-text rounded-full w-6 h-6 flex items-center justify-center hover:bg-error-hover"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedFile && !imagePreview && (
                <div className="mb-2 flex items-center space-x-2 text-sm text-text-muted">
                  <span>📎 {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={clearFileSelection}
                    className="text-error hover:text-error-hover"
                  >
                    ×
                  </button>
                </div>
              )}
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
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <p className="text-xl mb-2">Select a conversation or search for a user</p>
              <p className="text-sm">Start chatting with your friends!</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Picture Gallery */}
      {showProfileGallery && selectedUserId && (
        <ProfilePictureGallery
          userId={selectedUserId}
          onClose={() => {
            setShowProfileGallery(false);
            setSelectedUserId(null);
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-error text-error-text p-4 rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 text-error-text hover:text-error-text/80"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default SocialCircle;
