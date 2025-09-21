import React from 'react';

const EmailVerification = ({ user, onVerify, onResend, emailSent, onLogout }) => {
  const [verificationCode, setVerificationCode] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(verificationCode);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Verify Your Email</h2>
        <p>We've sent a verification code to {user?.email}</p>
        
        {emailSent && (
          <div className="success-message">
            Verification email sent successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-btn">
            Verify Email
          </button>
        </form>
        
        <div className="auth-links">
          <p>Didn't receive the email?</p>
          <button onClick={onResend} className="link-btn">
            Resend verification email
          </button>
        </div>
        
        <div className="auth-links">
          <button onClick={onLogout} className="link-btn">
            Use different email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;