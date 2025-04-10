import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import CSWD from "../pic/cswdlogo.png"
import Loading from "./again/Loading";
import Notification from "./again/Notif";
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName]= useState('');
    const [password, setUserPassword]= useState('');

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null); 


      useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/home"); // Redirect if already logged in
        }
    }, [navigate]);

      const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
      };
      
      const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userdata = {
                username: userName.trim(),
                password: password.trim(),
            };
    
            const response = await axios.post("http://192.168.1.24:3003/login", userdata);
    
            console.log("Login Response:", response.data); // Debug API response
    
            if (response.data.token && response.data.user.role) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", response.data.user.role);
                localStorage.setItem("username", response.data.user.username); 
    
                const decodedToken = jwtDecode( response.data.token);
                const expireTime = decodedToken.exp * 1000;
                
                setNotification({ 
                  type: "success", 
                  title: "Login Successful", 
                  message: "Welcome hehe!" 
              });

              navigate("/home");

              setTimeout(() => {
                localStorage.clear();
                navigate("/login");
              }, expireTime - Date.now());
              
            } else {
                console.error("Missing token or role in response");
                setNotification({
                  type: "error",
                  title: "Login Failed",
                  message: "Unexpected response from server. Please try again.",
              });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setNotification({
                type: "error",
                title: "Login Failed",
                message: "Invalid credentials. Please try again.",
            });

            setTimeout(() => {
              setNotification(null);
              setLoading(false);
          }, 500);
        }
    };
    

    return (
      <div className="login">
        <div className="loginBox">
          <div className="leftPanel">
            <h2 className="title">Log In</h2>
            <p className="subtitle">Please enter your details</p>
            <form className="form" onSubmit={handleLogin}>
                <input type="username" value={userName}  onChange={(e) => setUserName(e.target.value)} placeholder="Username" className="input" />
                <div className="passwordContainer">
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Password" 
                        className="input"
                    />
                    <span className="eyeIcon" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <div className="forgotPassword">forgot password?</div>
                <button className="loginButton">Log in</button>
            </form>
            
          </div>
          <motion.div
          className="rightPanel"
          initial={{ opacity: 0, x: 50 }}  // Initial animation when the page loads
          animate={{ opacity: 1, x: 0 }}   // Animation effect to bring the panel in
          transition={{ duration: 1, ease: "easeOut" }}  // Smooth transition effect on load
          whileHover={{ 
            scale: 1.05, 
            x: 10, 
            opacity: 1, 
            transition: { duration: 0.3 },
          }}  
        >
          <motion.div 
            className="cswdContent"
            initial={{ opacity: 0, y: -50 }}  // Image comes from top
            animate={{ opacity: 1, y: 0 }}    // Image animates to original position
            transition={{ duration: 1, ease: "easeOut" }}
            whileHover={{ opacity: 1, y: -10 }} // Hover effect on the content (image)
          >
            <motion.img
              src={CSWD}
              alt="CSWD Logo"
              className="image"
              initial={{ opacity: 0, y: -50 }}  // Image comes from top on page load
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }} // Hover effect for the image (slight zoom)
            />
            <motion.h3
              className="cswdText"
              initial={{ opacity: 0, x: -50 }}  // Text comes from the left
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              whileHover={{ x: 10 }}  // Hover effect for the text (slight shift)
            >
              City Social Welfare and Development Office
            </motion.h3>
            <motion.p
              className="cswdDescription"
              initial={{ opacity: 0, x: 50 }}  // Description comes from the right
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              whileHover={{ x: 10 }}  // Hover effect for the description (slight shift)
            >
              Dedicated to serving the community and strengthening resilience through timely disaster relief and support in times of crisis.
            </motion.p>
          </motion.div>
        </motion.div>
        </div>

        {loading && <Loading />} {/* Show loading spinner */}

        {notification && (
            <Notification
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification(null)} // Close notification
            />
        )}

      </div>
    );
  };
  
  export default Login;
  