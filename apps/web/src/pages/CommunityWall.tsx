import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getApiHeaders } from '../api';
import './CommunityWall.css';

interface Post {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: string[];
  comments: Comment[];
}

interface Comment {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const CommunityWall: React.FC = () => {
  const navigate = useNavigate();
  
  const isLoggedIn = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [newPost, setNewPost] = useState({ content: '', authorName: '', image: null as File | null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);
  
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('adminToken'));
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const status = filter === 'all' ? 'approved' : filter;
      const res = await fetch(getApiUrl(`community?status=${status}`), { headers: getApiHeaders() });
      if (!res.ok) throw new Error('שגיאה בטעינת הפוסטים');
      const data = (await res.json()) as Post[];
      setPosts(data);
      setApiError(null);
    } catch {
      setApiError('לא ניתן לטעון פוסטים. בדוק חיבור לשרת.');
    }
  }, [filter]);

  useEffect(() => {
    if (isLoggedIn) loadPosts();
  }, [isLoggedIn, loadPosts]);

  const handleCreatePost = async () => {
    if (!newPost.content.trim() || !newPost.authorName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('community'), {
        method: 'POST',
        headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost.content.trim(), authorName: newPost.authorName.trim() }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'שגיאה ביצירת הפוסט');
      }
      const created = (await res.json()) as Post;
      setPosts(prev => [created, ...prev]);
      setNewPost({ content: '', authorName: '', image: null });
      setShowCreateModal(false);
    } catch (e) {
      setApiError((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPost(prev => ({ ...prev, image: file }));
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(getApiUrl(`community/${postId}/like`), {
        method: 'POST',
        headers: getApiHeaders(),
      });
      if (!res.ok) return;
      const result = (await res.json()) as { likes: number; liked: boolean };
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, likes: Array(result.likes).fill('') }
          : p
      ));
    } catch {
      // silent fail for like
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      const res = await fetch(getApiUrl(`community/${postId}/status`), {
        method: 'PATCH',
        headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) return;
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'approved' as const } : p));
    } catch { /* silent */ }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      const res = await fetch(getApiUrl(`community/${postId}/status`), {
        method: 'PATCH',
        headers: { ...getApiHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (!res.ok) return;
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch { /* silent */ }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return post.status !== 'rejected';
    return post.status === filter;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    return `לפני ${days} ימים`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" className="me-2">ממתין לאישור</Badge>;
      case 'approved':
        return <Badge bg="success" className="me-2">אושר</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="me-2">נדחה</Badge>;
      default:
        return null;
    }
  };

  // אם המשתמש לא מחובר, מציגים הודעה
  if (!isLoggedIn) {
    return (
      <div className="container mt-5 text-center community-wall-auth">
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <i className="fas fa-lock fa-3x mb-3 community-wall-lock-icon"></i>
            <h2 className="mb-3 community-wall-restricted-title">גישה מוגבלת</h2>
            <p className="lead mb-4">עליך להתחבר כדי לגשת לקיר הקהילה</p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
                aria-label="התחברות"
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                התחברות
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
                aria-label="חזרה לדף הבית"
              >
                <i className="fas fa-home me-2"></i>
                חזרה לדף הבית
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-wall-container">
      <div className="container py-4">
        {/* כותרת */}
        <div className="text-center mb-4">
          <h1 className="display-5 mb-3 fw-bold community-wall-heading">
            <i className="fas fa-users me-3 community-wall-heading-icon" aria-hidden="true"></i>
            קיר הקהילה
          </h1>
          <p className="lead community-wall-lead">שתף, תגיב ותהיה מעורב בקהילה שלנו</p>
        </div>

        {/* כפתור יצירת פוסט */}
        <div className="text-center mb-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2"
            aria-label="צור פוסט חדש"
          >
            <i className="fas fa-plus me-2" aria-hidden="true"></i>
            צור פוסט חדש
          </Button>
        </div>

        {/* פילטרים */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <div className="btn-group w-100" role="group" aria-label="פילטר פוסטים">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('all')}
                    aria-pressed={filter === 'all'}
                  >
                    <i className="fas fa-globe me-1" aria-hidden="true"></i>
                    כל הפוסטים
                  </Button>
                  <Button
                    variant={filter === 'approved' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('approved')}
                    aria-pressed={filter === 'approved'}
                  >
                    <i className="fas fa-check me-1" aria-hidden="true"></i>
                    פוסטים מאושרים
                  </Button>
                  {isAdmin && (
                    <Button
                      variant={filter === 'pending' ? 'primary' : 'outline-primary'}
                      onClick={() => setFilter('pending')}
                      aria-pressed={filter === 'pending'}
                    >
                      <i className="fas fa-clock me-1" aria-hidden="true"></i>
                      ממתינים לאישור
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* רשימת פוסטים */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center">
                <div className="card shadow">
                  <div className="card-body py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3" aria-hidden="true"></i>
                    <h5 className="text-muted">אין פוסטים להצגה</h5>
                    <p className="text-muted">היה הראשון שיוצר פוסט בקהילה!</p>
                  </div>
                </div>
              </div>
            ) : (
              filteredPosts.map(post => (
                <Card key={post._id} className="shadow-lg mb-4 post-card">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-3">
                        <i className="fas fa-user-circle fa-2x community-wall-avatar-icon" aria-hidden="true"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{post.authorName}</h6>
                        <small className="text-muted">
                          {formatTime(post.createdAt)}
                          {getStatusBadge(post.status)}
                        </small>
                      </div>
                    </div>
                    {isAdmin && post.status === 'pending' && (
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprovePost(post._id)}
                          aria-label="אשר פוסט"
                        >
                          <i className="fas fa-check" aria-hidden="true"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectPost(post._id)}
                          aria-label="דחה פוסט"
                        >
                          <i className="fas fa-times" aria-hidden="true"></i>
                        </Button>
                      </div>
                    )}
                  </Card.Header>
                  
                  <Card.Body>
                    <Card.Text className="mb-3">{post.content}</Card.Text>
                    
                    {post.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={post.imageUrl}
                          alt="תמונה בפוסט – קיר קהילה Vantera"
                          className="img-fluid rounded cursor-pointer community-wall-post-image"
                          onClick={() => {
                            setSelectedImage(post.imageUrl!);
                            setShowImageModal(true);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedImage(post.imageUrl!);
                              setShowImageModal(true);
                            }
                          }}
                          aria-label="לחץ להגדלת התמונה"
                        />
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleLike(post._id)}
                        aria-label={`סמן לייק (${post.likes.length} לייקים)`}
                      >
                        <i className="fas fa-heart me-1" aria-hidden="true"></i>
                        {post.likes.length} לייקים
                      </Button>
                      
                      <small className="text-muted">
                        <i className="fas fa-comments me-1" aria-hidden="true"></i>
                        {post.comments.length} תגובות
                      </small>
                    </div>
                  </Card.Body>
                  
                  {/* תגובות */}
                  {post.comments.length > 0 && (
                    <Card.Footer className="bg-light">
                      <h6 className="mb-3">
                        <i className="fas fa-comments me-2" aria-hidden="true"></i>
                        תגובות
                      </h6>
                      {post.comments.map(comment => (
                        <div key={comment._id} className="d-flex mb-2">
                          <div className="avatar me-2">
                            <i className="fas fa-user-circle text-secondary" aria-hidden="true"></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="bg-white p-2 rounded">
                              <strong className="community-wall-comment-author">{comment.authorName}</strong>
                              <p className="mb-1">{comment.content}</p>
                              <small className="text-muted">{formatTime(comment.createdAt)}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Card.Footer>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* מודאל יצירת פוסט */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2" aria-hidden="true"></i>
            צור פוסט חדש
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>שם מלא</Form.Label>
              <Form.Control
                type="text"
                value={newPost.authorName}
                onChange={(e) => setNewPost(prev => ({ ...prev, authorName: e.target.value }))}
                placeholder="הכנס שם להצגה..."
                aria-label="שם המחבר"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>מה קורה אצלך?</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="שתף את המחשבות שלך עם הקהילה..."
                aria-label="תוכן הפוסט"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-image me-2" aria-hidden="true"></i>
                הוסף תמונה (אופציונלי)
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="בחר תמונה"
              />
              <Form.Text className="text-muted">
                ניתן להעלות תמונות בפורמט JPG, PNG או GIF
              </Form.Text>
            </Form.Group>
            
            {newPost.image && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(newPost.image)}
                  alt="תמונה שנבחרה להעלאה – קיר קהילה"
                  className="img-fluid rounded community-wall-upload-preview"
                />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            ביטול
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            disabled={!newPost.content.trim() || !newPost.authorName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                שולח...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2" aria-hidden="true"></i>
                פרסם
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* מודאל הצגת תמונה */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>תמונה</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={selectedImage}
            alt="תמונה מוגדלת – צפייה מלאה"
            className="img-fluid community-wall-modal-image"
          />
        </Modal.Body>
      </Modal>

      {/* הודעת שגיאה */}
      {apiError && (
        <Alert variant="danger" className="position-fixed bottom-0 end-0 m-3" dismissible onClose={() => setApiError(null)}>
          <i className="fas fa-exclamation-circle me-2" aria-hidden="true"></i>
          {apiError}
        </Alert>
      )}

      {/* הודעה על אישור מנהל */}
      <Alert variant="info" className="position-fixed bottom-0 start-0 m-3 community-wall-info-alert">
        <i className="fas fa-info-circle me-2" aria-hidden="true"></i>
        <strong>חשוב לדעת:</strong> כל הפוסטים עוברים אישור מנהל לפני פרסום
      </Alert>
    </div>
  );
};

export default CommunityWall; 