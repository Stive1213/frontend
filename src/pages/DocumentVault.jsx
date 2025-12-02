import { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and search states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Uncategorized');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Edit states
  const [editingDoc, setEditingDoc] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Load documents and categories
  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [selectedCategory, searchQuery]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await documentsAPI.getAll(params);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await documentsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      // Auto-set category based on file type if not set
      if (!uploadCategory || uploadCategory === 'Uncategorized') {
        const ext = file.name.split('.').pop().toLowerCase();
        const categoryMap = {
          pdf: 'Documents',
          doc: 'Documents',
          docx: 'Documents',
          xls: 'Spreadsheets',
          xlsx: 'Spreadsheets',
          ppt: 'Presentations',
          pptx: 'Presentations',
          jpg: 'Images',
          jpeg: 'Images',
          png: 'Images',
          gif: 'Images',
          zip: 'Archives',
        };
        setUploadCategory(categoryMap[ext] || 'Uncategorized');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
      
      const tagsArray = uploadTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      formData.append('tags', JSON.stringify(tagsArray));

      await documentsAPI.upload(formData);
      
      // Reset form
      setUploadFile(null);
      setUploadCategory('Uncategorized');
      setUploadDescription('');
      setUploadTags('');
      setShowUploadForm(false);
      
      // Reload documents and categories
      await loadDocuments();
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
      console.error('Error uploading document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setEditCategory(doc.category);
    setEditDescription(doc.description || '');
    setEditTags(doc.tags?.join(', ') || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      setError(null);
      const tagsArray = editTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await documentsAPI.update(editingDoc.id, {
        category: editCategory,
        description: editDescription,
        tags: JSON.stringify(tagsArray),
      });

      setEditingDoc(null);
      await loadDocuments();
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update document');
      console.error('Error updating document:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setError(null);
      await documentsAPI.delete(id);
      await loadDocuments();
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentsAPI.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download document');
      console.error('Error downloading document:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group documents by category
  const groupedDocuments = documents.reduce((acc, doc) => {
    const category = doc.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  const categoryOrder = ['All', ...categories.map((c) => c.category).sort(), 'Uncategorized'];

  return (
    <div className="text-text-primary p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Document Vault</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          {showUploadForm ? 'Cancel Upload' : '+ Upload Document'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/20 border border-error text-error-text p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Upload Document</h3>
          <form onSubmit={handleUpload}>
            <div className="space-y-4">
              <div>
                <label htmlFor="file-input" className="block text-sm text-text-muted mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
                  required
                />
                {uploadFile && (
                  <p className="mt-2 text-sm text-text-muted">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="upload-category" className="block text-sm text-text-muted mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    id="upload-category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                    placeholder="e.g., Taxes, Work, Personal"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="upload-tags" className="block text-sm text-text-muted mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="upload-tags"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                    placeholder="e.g., important, 2024, receipt"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="upload-description" className="block text-sm text-text-muted mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="upload-description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows="3"
                  className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
                  placeholder="Add a description for this document..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full bg-primary text-primary-text py-2 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-card-bg border border-card-border p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category-filter" className="block text-sm text-text-muted mb-2">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm text-text-muted mb-2">
              Search Documents
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
              placeholder="Search by name, description, or tags..."
            />
          </div>
        </div>
      </div>

      {/* Documents List - Grouped by Category */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-muted">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-card-bg border border-card-border p-12 rounded-lg shadow text-center">
          <p className="text-text-muted text-lg">No documents found.</p>
          <p className="text-text-muted mt-2">Upload your first document to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedCategory === 'All' ? (
            // Show grouped by category
            Object.keys(groupedDocuments)
              .sort()
              .map((category) => (
                <div key={category} className="bg-card-bg border border-card-border rounded-lg shadow">
                  <div className="bg-primary/10 px-6 py-3 border-b border-card-border">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {category} ({groupedDocuments[category].length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-divider">
                            <th className="p-3 text-text-muted">Name</th>
                            <th className="p-3 text-text-muted">Size</th>
                            <th className="p-3 text-text-muted">Tags</th>
                            <th className="p-3 text-text-muted">Uploaded</th>
                            <th className="p-3 text-text-muted">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedDocuments[category].map((doc) => (
                            <tr key={doc.id} className="border-b border-divider hover:bg-card-bg/50">
                              <td className="p-3">
                                <div>
                                  <p className="text-text-primary font-medium">{doc.original_filename}</p>
                                  {doc.description && (
                                    <p className="text-sm text-text-muted mt-1">{doc.description}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-text-muted">{formatFileSize(doc.file_size)}</td>
                              <td className="p-3">
                                {doc.tags && doc.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {doc.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-primary-light text-primary text-xs px-2 py-1 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-text-muted text-sm">No tags</span>
                                )}
                              </td>
                              <td className="p-3 text-text-muted text-sm">{formatDate(doc.uploaded_at)}</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDownload(doc)}
                                    className="bg-success text-success-text px-3 py-1 rounded-lg hover:bg-success-hover transition-colors text-sm"
                                  >
                                    Download
                                  </button>
                                  <button
                                    onClick={() => handleEdit(doc)}
                                    className="bg-primary text-primary-text px-3 py-1 rounded-lg hover:bg-primary-hover transition-colors text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="bg-error text-error-text px-3 py-1 rounded-lg hover:bg-error-hover transition-colors text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            // Show single category view
            <div className="bg-card-bg border border-card-border rounded-lg shadow">
              <div className="bg-primary/10 px-6 py-3 border-b border-card-border">
                <h3 className="text-lg font-semibold text-text-primary">
                  {selectedCategory} ({documents.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-divider">
                        <th className="p-3 text-text-muted">Name</th>
                        <th className="p-3 text-text-muted">Size</th>
                        <th className="p-3 text-text-muted">Tags</th>
                        <th className="p-3 text-text-muted">Uploaded</th>
                        <th className="p-3 text-text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b border-divider hover:bg-card-bg/50">
                          <td className="p-3">
                            <div>
                              <p className="text-text-primary font-medium">{doc.original_filename}</p>
                              {doc.description && (
                                <p className="text-sm text-text-muted mt-1">{doc.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-text-muted">{formatFileSize(doc.file_size)}</td>
                          <td className="p-3">
                            {doc.tags && doc.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {doc.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block bg-primary-light text-primary text-xs px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-text-muted text-sm">No tags</span>
                            )}
                          </td>
                          <td className="p-3 text-text-muted text-sm">{formatDate(doc.uploaded_at)}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownload(doc)}
                                className="bg-success text-success-text px-3 py-1 rounded-lg hover:bg-success-hover transition-colors text-sm"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleEdit(doc)}
                                className="bg-primary text-primary-text px-3 py-1 rounded-lg hover:bg-primary-hover transition-colors text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="bg-error text-error-text px-3 py-1 rounded-lg hover:bg-error-hover transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-card-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">Edit Document</h3>
                <button
                  onClick={() => setEditingDoc(null)}
                  className="text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">File Name</label>
                    <input
                      type="text"
                      value={editingDoc.original_filename}
                      disabled
                      className="w-full p-2 rounded-lg bg-input-bg/50 text-input-text border border-input-border opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows="3"
                      className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
                      placeholder="e.g., important, 2024, receipt"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-primary-text py-2 rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDoc(null)}
                      className="flex-1 bg-card-bg border border-card-border text-text-primary py-2 rounded-lg hover:bg-card-bg/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentVault;
