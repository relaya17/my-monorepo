 // components/Voting.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchVotes, castVote } from '../redux/slice/votingSlice';

const Voting: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { votes, loading, error, castLoading } = useSelector((state: RootState) => state.voting);

  useEffect(() => {
    dispatch(fetchVotes('Open'));
  }, [dispatch]);

  const handleVote = (voteId: string, optionIndex: number) => {
    dispatch(castVote({ voteId, optionIndex }));
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
            ׳”׳¦׳‘׳¢׳•׳× ׳“׳™׳™׳¨׳™׳
          </h1>
          <p className="text-white-50 fs-5">
            ׳”׳©׳×׳×׳£ ׳‘׳”׳—׳׳˜׳•׳× ׳”׳§׳”׳™׳׳” - ׳”׳¦׳‘׳¢ ׳¢׳ ׳”׳ ׳•׳©׳׳™׳ ׳”׳—׳©׳•׳‘׳™׳ ׳׳
          </p>
        </div>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">׳˜׳•׳¢׳...</span>
            </div>
          </div>
        ) : votes.length === 0 ? (
          <div className="text-center">
            <div className="card shadow-lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="card-body p-5">
                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h3 className="text-muted">׳׳™׳ ׳”׳¦׳‘׳¢׳•׳× ׳₪׳×׳•׳—׳•׳× ׳›׳¨׳’׳¢</h3>
                <p className="text-muted">׳‘׳“׳•׳§ ׳©׳•׳‘ ׳׳׳•׳—׳¨ ׳™׳•׳×׳¨ ׳׳• ׳₪׳ ׳” ׳׳׳ ׳”׳ ׳”׳׳¢׳¨׳›׳×</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {votes.map((vote, voteIndex) => (
              <div key={vote._id} className="col-12 col-lg-8 mx-auto">
                <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                  <div className="card-header bg-primary text-white text-center py-3" 
                       style={{ borderRadius: '15px 15px 0 0' }}>
                    <h4 className="mb-0">
                      <i className="fas fa-question-circle ms-2"></i>
                      ׳”׳¦׳‘׳¢׳” {voteIndex + 1}
                    </h4>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="card-title text-center mb-2" style={{ color: '#2c3e50', fontSize: '1.3rem' }}>
                      {vote.title}
                    </h5>
                    {vote.description && (
                      <p className="text-muted text-center mb-4">{vote.description}</p>
                    )}
                    {vote.deadline && (
                      <p className="text-center text-secondary small mb-3">
                        <i className="fas fa-clock ms-1"></i>
                        ׳׳•׳¢׳“ ׳׳—׳¨׳•׳: {new Date(vote.deadline).toLocaleDateString('he-IL')}
                      </p>
                    )}
                    
                    <div className="row g-3">
                      {vote.options.map((option, index) => (
                        <div key={index} className="col-12">
                          <div className="d-flex justify-content-between align-items-center p-3 border rounded"
                               style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                  {String.fromCharCode(65 + index)}
                                </div>
                              </div>
                              <span className="fs-5" style={{ color: '#495057' }}>
                                {option.text}
                              </span>
                            </div>
                            
                            <button 
                              className="btn btn-outline-primary"
                              style={{ borderRadius: '25px', padding: '8px 20px', fontWeight: 'bold' }}
                              disabled={castLoading}
                              onClick={() => handleVote(vote._id, index)}
                            >
                              {castLoading ? (
                                <span className="spinner-border spinner-border-sm" role="status" />
                              ) : (
                                <>
                                  <i className="fas fa-vote-yea ms-2"></i>
                                  ׳”׳¦׳‘׳¢
                                </>
                              )}
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
            <strong>׳׳™׳“׳¢ ׳—׳©׳•׳‘:</strong> ׳›׳ ׳“׳™׳™׳¨ ׳™׳›׳•׳ ׳׳”׳¦׳‘׳™׳¢ ׳₪׳¢׳ ׳׳—׳× ׳‘׳׳‘׳“ ׳‘׳›׳ ׳”׳¦׳‘׳¢׳”
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voting;
