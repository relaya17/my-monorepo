import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../redux/store';

interface Post {
  id: string;
  author: string;
  content: string;
  image?: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

const CommunityWall: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  
  // בדיקה אם המשתמש מחובר
  const isLoggedIn = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
  
  // אם המשתמש לא מחובר, הפניה לדף התחברות
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isLoggedIn, navigate]);
  
  // אם המשתמש לא מחובר, מציגים הודעה
  if (!isLoggedIn) {
    return (
      <div className="container mt-5 text-center" style={{ direction: 'rtl' }}>
        <div className="card shadow-lg">
          <div className="card-body p-5">
            <i className="fas fa-lock fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="mb-3" style={{ color: '#374151' }}>גישה מוגבלת</h2>
            <p className="lead mb-4">עליך להתחבר כדי לגשת לקיר הקהילה</p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                התחברות
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
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
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [newPost, setNewPost] = useState({
    content: '',
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // בדיקה אם המשתמש הוא מנהל
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  // דוגמה לפוסטים
  useEffect(() => {
    const samplePosts: Post[] = [
      {
        id: '1',
        author: 'דוד כהן',
        content: 'היום היה יום נהדר בגינה! הגינה נקייה והמתקנים במצב מעולה. תודה לכל מי שתורם לתחזוקה! 🌟',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'approved',
        likes: 12,
        comments: [
          {
            id: '1',
            author: 'שרה לוי',
            content: 'מסכימה איתך! הגינה נראית נהדר',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: '2',
        author: 'מיכל רוזן',
        content: 'הצעה: אולי נוכל לארגן מסיבת קיץ משותפת? מה דעתכם? 🎉',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'pending',
        likes: 8,
        comments: []
      },
      {
        id: '3',
        author: 'יוסי גולדברג',
        content: 'תזכורת: ישיבת ועד דיירים ביום שלישי הקרוב בשעה 19:00. כולם מוזמנים! 📅',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'approved',
        likes: 15,
        comments: [
          {
            id: '2',
            author: 'רחל כהן',
            content: 'אני אגיע! יש נושאים חשובים לדון בהם',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            id: '3',
            author: 'דן אברהם',
            content: 'גם אני אגיע. חשוב להיות מעורבים',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ]
      }
    ];
    setPosts(samplePosts);
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    setIsSubmitting(true);
    
    // סימולציה של שליחה לשרת
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const post: Post = {
      id: Date.now().toString(),
      author: 'משתמש נוכחי',
      content: newPost.content,
      image: newPost.image ? URL.createObjectURL(newPost.image) : undefined,
      timestamp: new Date(),
      status: 'pending',
      likes: 0,
      comments: []
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost({ content: '', image: null });
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPost(prev => ({ ...prev, image: file }));
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleApprovePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status: 'approved' as const } : post
    ));
  };

  const handleRejectPost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status: 'rejected' as const } : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return post.status !== 'rejected';
    return post.status === filter;
  });

  const formatTime = (date: Date) => {
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

  return (
    <div className="community-wall-container" style={{ 
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      paddingTop: '80px',
      direction: 'rtl'
    }}>
      <div className="container py-4">
        {/* כותרת */}
        <div className="text-center mb-4">
          <h1 className="display-5 mb-3" style={{ color: '#374151', fontWeight: 'bold' }}>
            <i className="fas fa-users me-3" aria-hidden="true" style={{ color: '#6b7280' }}></i>
            קיר הקהילה
          </h1>
          <p className="lead" style={{ color: '#6b7280' }}>שתף, תגיב ותהיה מעורב בקהילה שלנו</p>
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
                <Card key={post.id} className="shadow-lg mb-4 post-card">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-3">
                        <i className="fas fa-user-circle fa-2x" aria-hidden="true" style={{ color: '#6b7280' }}></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{post.author}</h6>
                        <small className="text-muted">
                          {formatTime(post.timestamp)}
                          {getStatusBadge(post.status)}
                        </small>
                      </div>
                    </div>
                    {isAdmin && post.status === 'pending' && (
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprovePost(post.id)}
                          aria-label="אשר פוסט"
                        >
                          <i className="fas fa-check" aria-hidden="true"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectPost(post.id)}
                          aria-label="דחה פוסט"
                        >
                          <i className="fas fa-times" aria-hidden="true"></i>
                        </Button>
                      </div>
                    )}
                  </Card.Header>
                  
                  <Card.Body>
                    <Card.Text className="mb-3">{post.content}</Card.Text>
                    
                    {post.image && (
                      <div className="mb-3">
                        <img
                          src={post.image}
                          alt="תמונה בפוסט"
                          className="img-fluid rounded cursor-pointer"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                          onClick={() => {
                            setSelectedImage(post.image!);
                            setShowImageModal(true);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedImage(post.image!);
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
                        onClick={() => handleLike(post.id)}
                        aria-label={`סמן לייק (${post.likes} לייקים)`}
                      >
                        <i className="fas fa-heart me-1" aria-hidden="true"></i>
                        {post.likes} לייקים
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
                        <div key={comment.id} className="d-flex mb-2">
                          <div className="avatar me-2">
                            <i className="fas fa-user-circle text-secondary" aria-hidden="true"></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="bg-white p-2 rounded">
                              <strong style={{ color: '#6b7280' }}>{comment.author}</strong>
                              <p className="mb-1">{comment.content}</p>
                              <small className="text-muted">{formatTime(comment.timestamp)}</small>
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
                  alt="תמונה שנבחרה"
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px' }}
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
            disabled={!newPost.content.trim() || isSubmitting}
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
            alt="תמונה מוגדלת"
            className="img-fluid"
            style={{ maxHeight: '70vh' }}
          />
        </Modal.Body>
      </Modal>

      {/* הודעה על אישור מנהל */}
      <Alert variant="info" className="position-fixed bottom-0 start-0 m-3" style={{ zIndex: 1000 }}>
        <i className="fas fa-info-circle me-2" aria-hidden="true"></i>
        <strong>חשוב לדעת:</strong> כל הפוסטים עוברים אישור מנהל לפני פרסום
      </Alert>
    </div>
  );
};

export default CommunityWall; 