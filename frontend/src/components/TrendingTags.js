// frontend/src/components/TrendingTags.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import './TrendingTags.css';

const TrendingTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  const fetchTrendingTags = async () => {
    try {
      const response = await postAPI.getTrendingTags();
      setTags(response.data.slice(0, 10)); // Show top 10
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="trending-tags-card">
        <h3>🔥 Trending Tags</h3>
        <div className="loading-tags">Loading...</div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="trending-tags-card">
      <h3>🔥 Trending Tags</h3>
      <div className="tags-list">
        {tags.map((tag, index) => (
          <Link
            key={tag._id}
            to={`/tag/${tag._id}`}
            className="trending-tag"
          >
            <span className="tag-name">#{tag._id}</span>
            <span className="tag-count">{tag.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTags;