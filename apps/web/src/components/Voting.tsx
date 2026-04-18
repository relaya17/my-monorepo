// components/Voting.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchQuestions, vote } from '../redux/slice/votingSlice';

const Voting: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const questions = useSelector((state: RootState) => state.voting.questions);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const handleVote = (questionId: string, optionIndex: number) => {
    dispatch(vote({ questionId, optionIndex }));
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
         style={{ 
           minHeight: '100vh', 
           background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
           direction: 'rtl'
         }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <i className="fas fa-vote-yea fa-3x text-white mb-3"></i>
          <h1 className="text-white mb-3" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            הצבעות דיירים
          </h1>
          <p className="text-white-50 fs-5">
            השתתף בהחלטות הקהילה - הצבע על הנושאים החשובים לך
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="text-center">
            <div className="card shadow-lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="card-body p-5">
                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h3 className="text-muted">אין שאלות הצבעה זמינות</h3>
                <p className="text-muted">בדוק שוב מאוחר יותר או פנה למנהל המערכת</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {questions.map((question, questionIndex) => (
              <div key={question._id} className="col-12 col-lg-8 mx-auto">
                <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                  <div className="card-header bg-primary text-white text-center py-3" 
                       style={{ borderRadius: '15px 15px 0 0' }}>
                    <h4 className="mb-0">
                      <i className="fas fa-question-circle ms-2"></i>
                      שאלה {questionIndex + 1}
                    </h4>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="card-title text-center mb-4" style={{ color: '#2c3e50', fontSize: '1.3rem' }}>
                      {question.question}
                    </h5>
                    
                    <div className="row g-3">
                      {question.options.map((option, index) => (
                        <div key={index} className="col-12">
                          <div className="d-flex justify-content-between align-items-center p-3 border rounded"
                               style={{ 
                                 backgroundColor: '#f8f9fa',
                                 borderColor: '#e9ecef',
                                 transition: 'all 0.3s ease'
                               }}
                               onMouseEnter={(e) => {
                                 e.currentTarget.style.backgroundColor = '#e3f2fd';
                                 e.currentTarget.style.borderColor = '#2196f3';
                               }}
                               onMouseLeave={(e) => {
                                 e.currentTarget.style.backgroundColor = '#f8f9fa';
                                 e.currentTarget.style.borderColor = '#e9ecef';
                               }}>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                  {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                                </div>
                              </div>
                              <span className="fs-5" style={{ color: '#495057' }}>
                                {option.text}
                              </span>
                            </div>
                            
                            <button 
                              className="btn btn-outline-primary"
                              style={{ 
                                borderRadius: '25px',
                                padding: '8px 20px',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={() => handleVote(question._id, index)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#007bff';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#007bff';
                              }}
                            >
                              <i className="fas fa-vote-yea ms-2"></i>
                              הצבע
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <div className="alert alert-info d-inline-block" style={{ maxWidth: '600px' }}>
            <i className="fas fa-info-circle ms-2"></i>
            <strong>מידע חשוב:</strong> כל דייר יכול להצביע פעם אחת בלבד בכל שאלה
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voting;
