import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';

const CommentBox = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getCommentsByPost(postId);
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const commentData = {
        postId,
        content: newComment,
        authorId: currentUser.uid
      };

      const response = await commentAPI.createComment(commentData);
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const commentData = {
        content: editContent,
        authorId: currentUser.uid
      };

      const response = await commentAPI.updateComment(commentId, commentData);
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentAPI.deleteComment(commentId, currentUser.uid);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div style={styles.commentBox}>
      <h3>Comments ({comments.length})</h3>
      
      {/* Add Comment Form */}
      {currentUser ? (
        <form onSubmit={handleAddComment} style={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={styles.commentInput}
            rows="3"
          />
          <button type="submit" style={styles.submitBtn}>
            Add Comment
          </button>
        </form>
      ) : (
        <p style={styles.loginPrompt}>Please log in to add comments.</p>
      )}

      {/* Comments List */}
      <div style={styles.commentsList}>
        {comments.length === 0 ? (
          <p style={styles.noComments}>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <small style={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </small>
                {currentUser && currentUser.uid === comment.authorId && (
                  <div style={styles.commentActions}>
                    <button 
                      onClick={() => handleEditComment(comment)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment._id ? (
                <div style={styles.editForm}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={styles.commentInput}
                    rows="3"
                  />
                  <div style={styles.editActions}>
                    <button 
                      onClick={() => handleUpdateComment(comment._id)}
                      style={styles.saveBtn}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingComment(null)}
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={styles.commentContent}>{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  commentBox: {
    marginTop: '2rem',
    borderTop: '2px solid #eee',
    paddingTop: '1.5rem'
  },
  commentForm: {
    marginBottom: '2rem'
  },
  commentInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    marginBottom: '0.5rem'
  },
  submitBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  loginPrompt: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: '1rem'
  },
  commentsList: {
    marginTop: '1rem'
  },
  noComments: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '2rem'
  },
  comment: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #e9ecef'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  commentDate: {
    color: '#666',
    fontSize: '0.875rem'
  },
  commentActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  commentContent: {
    margin: 0,
    lineHeight: '1.5'
  },
  editForm: {
    marginTop: '0.5rem'
  },
  editActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  saveBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
};

export default CommentBox;