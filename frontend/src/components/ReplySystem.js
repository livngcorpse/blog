// frontend/src/components/ReplySystem.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { replyAPI } from '../services/api';
import './ReplySystem.css';

const ReplyItem = ({ reply, userData, onDelete, onReply, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(
    reply.likes?.some(like => like.userId === userData?._id) || false
  );
  const [likesCount, setLikesCount] = useState(reply.likesCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await replyAPI.toggleLikeReply(reply._id, userData._id);
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await onReply(reply._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    try {
      await replyAPI.updateReply(reply._id, {
        content: editContent,
        userId: userData._id
      });
      reply.content = editContent;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isAuthor = userData && reply.authorId?._id === userData._id;
  const maxNestLevel = 2;

  return (
    <div className={`reply-item reply-level-${Math.min(level, maxNestLevel)}`}>
      <div className="reply-avatar-line">
        {reply.authorId?.profilePhoto ? (
          <img
            src={reply.authorId.profilePhoto}
            alt={reply.authorId.displayName}
            className="reply-avatar"
          />
        ) : (
          <div className="reply-avatar reply-avatar-placeholder">
            {getInitials(reply.authorId?.displayName)}
          </div>
        )}
      </div>

      <div className="reply-content-wrapper">
        <div className="reply-header">
          <div className="reply-author-info">
            <span className="reply-author-name">{reply.authorId?.displayName}</span>
            <span className="reply-author-username">@{reply.authorId?.username}</span>
            <span className="reply-date">{formatDate(reply.createdAt)}</span>
          </div>

          {isAuthor && (
            <div className="reply-actions">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="reply-action-btn"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(reply._id)}
                className="reply-action-btn delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="reply-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="reply-edit-input"
              rows="3"
            />
            <div className="reply-edit-actions">
              <button onClick={handleUpdate} className="reply-save-btn">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="reply-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="reply-text">{reply.content}</p>
        )}

        <div className="reply-footer">
          <button
            onClick={handleLike}
            className={`reply-interaction-btn ${liked ? 'liked' : ''}`}
          >
            <span className="interaction-icon">{liked ? '❤️' : '🤍'}</span>
            <span className="interaction-count">{likesCount}</span>
          </button>

          {level < maxNestLevel && userData && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="reply-interaction-btn"
            >
              <span className="interaction-icon">💬</span>
              <span className="interaction-text">Reply</span>
            </button>
          )}

          {reply.repliesCount > 0 && (
            <span className="reply-count-badge">
              {reply.repliesCount} {reply.repliesCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="nested-reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${reply.authorId?.displayName}...`}
              className="nested-reply-input"
              rows="3"
            />
            <div className="nested-reply-actions">
              <button type="submit" className="nested-reply-submit">
                Reply
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="nested-reply-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {reply.replies && reply.replies.length > 0 && (
          <div className="nested-replies">
            {reply.replies.map(nestedReply => (
              <ReplyItem
                key={nestedReply._id}
                reply={nestedReply}
                userData={userData}
                onDelete={onDelete}
                onReply={onReply}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReplySystem = ({ postId, userData }) => {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  const fetchReplies = async () => {
    try {
      const response = await replyAPI.getRepliesByPost(postId);
      setReplies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching replies:', error);
      setLoading(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const replyData = {
        postId,
        content: newReply,
        firebaseUid: userData.firebaseUid || userData._id
      };

      const response = await replyAPI.createReply(replyData);
      setReplies([response.data, ...replies]);
      setNewReply('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleReplyToReply = async (parentReplyId, content) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const replyData = {
        postId,
        parentReplyId,
        content,
        firebaseUid: userData.firebaseUid || userData._id
      };

      const response = await replyAPI.createReply(replyData);
      
      // Update the nested replies
      const updateNestedReplies = (replies) => {
        return replies.map(reply => {
          if (reply._id === parentReplyId) {
            return {
              ...reply,
              replies: [...(reply.replies || []), response.data],
              repliesCount: (reply.repliesCount || 0) + 1
            };
          }
          if (reply.replies && reply.replies.length > 0) {
            return {
              ...reply,
              replies: updateNestedReplies(reply.replies)
            };
          }
          return reply;
        });
      };

      setReplies(updateNestedReplies(replies));
    } catch (error) {
      console.error('Error adding nested reply:', error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await replyAPI.deleteReply(replyId, userData._id);
      
      const removeReply = (replies) => {
        return replies
          .filter(reply => reply._id !== replyId)
          .map(reply => ({
            ...reply,
            replies: reply.replies ? removeReply(reply.replies) : []
          }));
      };

      setReplies(removeReply(replies));
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="replies-loading">
        <div className="spinner-small"></div>
        <p>Loading replies...</p>
      </div>
    );
  }

  return (
    <div className="reply-system">
      <div className="reply-system-header">
        <h3 className="replies-title">
          Replies ({replies.length})
        </h3>
      </div>

      {userData ? (
        <form onSubmit={handleAddReply} className="reply-form">
          <div className="reply-form-header">
            {userData.profilePhoto ? (
              <img
                src={userData.profilePhoto}
                alt={userData.displayName}
                className="reply-form-avatar"
              />
            ) : (
              <div className="reply-form-avatar reply-avatar-placeholder">
                {userData.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="reply-form-content">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share your thoughts..."
              className="reply-input"
              rows="3"
            />
            <button type="submit" className="reply-submit-btn">
              Post Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="reply-login-prompt">
          <p>Please <a href="/login">log in</a> to join the conversation</p>
        </div>
      )}

      <div className="replies-list">
        {replies.length === 0 ? (
          <div className="no-replies">
            <div className="no-replies-icon">💬</div>
            <p>No replies yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          replies.map(reply => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              userData={userData}
              onDelete={handleDeleteReply}
              onReply={handleReplyToReply}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReplySystem;