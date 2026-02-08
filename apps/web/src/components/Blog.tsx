// Blog.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { addComment, fetchPosts, addPostAsync } from '../redux/slice/blogSlice';

const Blog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.blog);
  const [newPost, setNewPost] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleAddPost = () => {
    if (newPost.trim()) {
      dispatch(addPostAsync({ content: newPost, author: 'דייר אנונימי' }));
      setNewPost('');
    }
  };

  const handleAddComment = (postId: string) => {
    if (comment.trim()) {
      dispatch(addComment({ postId, text: comment, author: 'דייר אנונימי' }));
      setComment('');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">טוען...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">בלוג קהילתי</h2>

      <div className="mb-4">
        <textarea
          className="form-control"
          placeholder="מה ברצונך לשתף היום?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleAddPost}>
          פרסם
        </button>
      </div>

      {posts.map((post) => (
        <div key={post.id} className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{post.author}</h5>
            <p className="card-text">{post.content}</p>

            <h6>תגובות:</h6>
            {post.comments.map((comment) => (
              <p key={comment.id}>
                <strong>{comment.author}:</strong> {comment.text}
              </p>
            ))}

            <textarea
              className="form-control mt-2"
              placeholder="הוסף תגובה"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="btn btn-secondary mt-2"
              onClick={() => handleAddComment(post.id)}
            >
              שלח תגובה
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blog;
