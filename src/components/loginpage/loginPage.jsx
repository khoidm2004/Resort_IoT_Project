import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import useLogin from '../../hooks/AuthenicationHooks/useLogin';
import useSignUpWithEmailAndPassword from '../../hooks/AuthenicationHooks/useSignUpWithEmailAndPassword'; 
import useAuthStore from '../../store/authStore';
import Popup from '../popup/popup';
import { useNavigate } from 'react-router-dom';
import useReclaimPassword from '../../hooks/AuthenicationHooks/useReclaimPassword';  
import '../loader.css';

const images = [
  '/img1.png',
  '/img2.png',
  '/img3.png',
  '/img4.png',
  '/img5.png',
  '/img6.png',
];

const LoginPage = () => {
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const { signUp, loading: signUpLoading, error: signUpError } = useSignUpWithEmailAndPassword(); 
  const user = useAuthStore((state) => state.user);
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '', phoneNum: '' }); 
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const navigate = useNavigate();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    status: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      console.log('User data after login or sign-up:', user);
      if (popup.status === "success") {
        if (user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/client/sauna');
        }
      }
    }
  }, [user, popup.status, navigate]);

  useEffect(() => {
    if (popup.show) {
      const timeout = setTimeout(() => {
        setPopup(prevPopup => ({ ...prevPopup, show: false }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popup.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (signUpData.email && signUpData.password && signUpData.fullName && signUpData.phoneNum) {
        try {
          const result = await signUp(signUpData);
          setPopup({
            show: true,
            title: result.Title,
            message: result.Message,
            status: result.Status,
          });
        } catch (error) {
          console.error('Sign-up failed', error);
        }
      }
    } else if (isForgotPassword) {
      if (forgotPasswordEmail) {
        try {
          const result = await useReclaimPassword(forgotPasswordEmail);
          setPopup({
            show: true,
            title: result.Title,
            message: result.Message,
            status: result.Status,
          });
        } catch (error) {
          console.error('Forgot password failed', error);
        }
      }
    } else {
      if (formData.email && formData.password) {
        try {
          const result = await login(formData);
          setPopup({
            show: true,
            title: result.Title,
            message: result.Message,
            status: result.Status,
          });
        } catch (error) {
          console.error('Login failed', error);
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isSignUp) {
      setSignUpData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (isForgotPassword) {
      setForgotPasswordEmail(value);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return (
    <div className="loginPage">
      <div className="slideshow">
        <img src={images[currentImage]} alt="Slideshow" className="slideshow-image" />
      </div>
      <div className="login-form">
        <div className="login-box">
          <h2>{isSignUp ? "Sign Up" : isForgotPassword ? "Forgot Password" : "Login"}</h2>
          <form onSubmit={handleSubmit}>
            {isForgotPassword ? (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={handleChange}
                  required
                />
                <button type="submit" disabled={loginLoading}>
                  {loginLoading ? <div className="loader"></div> : 'Send Reset Email'}
                </button>
                <p onClick={() => setIsForgotPassword(false)} className="toggle-link">Back to Login</p>
              </>
            ) : (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={isSignUp ? signUpData.email : formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={isSignUp ? signUpData.password : formData.password}
                  onChange={handleChange}
                  title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
                  required
                />
                {isSignUp && (
                  <>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={signUpData.fullName}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="number"
                      name="phoneNum"
                      placeholder="Phone Number"
                      value={signUpData.phoneNum}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
                <button type="submit" disabled={isSignUp ? signUpLoading : loginLoading}>
                  {isSignUp
                    ? signUpLoading
                      ? <div className="loader"></div>  
                      : 'Sign Up'
                    : loginLoading
                    ? <div className="loader"></div>  
                    : 'Login'}
                </button>
                {!isSignUp && (
                  <p onClick={() => setIsForgotPassword(true)} className="toggle-link">
                    Forgot Password?
                  </p>
                )}
              </>
            )}
          </form>
          {isSignUp ? signUpError && <p className="error">{signUpError}</p> : loginError && <p className="error">{loginError}</p>}
          {!isForgotPassword && (
            <p onClick={() => setIsSignUp(!isSignUp)} className="toggle-link">
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </p>
          )}
        </div>
      </div>
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          status={popup.status}
        />
      )}
    </div>
  );
};

export default LoginPage;