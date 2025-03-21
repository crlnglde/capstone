import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import CSWD from "../pic/cswdlogo.png"

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName]= useState('');
    const [password, setUserPassword]= useState('');

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
      };

      const handleLogin = async (e) => {
        e.preventDefault();
        try {
          const userdata = {
            username: userName.trim(),
            password: password.trim(),
          };
      
          const response = await axios.post("http://localhost:3003/login", userdata);
      
          // Store the token in localStorage
          localStorage.setItem("token", response.data.token);
      
          // Navigate to home after successful login
          navigate("/home");
        } catch (error) {
          console.error("Error logging in:", error);
      
          // Handle incorrect credentials
          if (error.response && error.response.status === 400) {
            alert("Invalid username or password.");
          } else {
            alert("Failed to login. Please try again later.");
          }
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
            initial={{ opacity: 0, x: 50 }} // Start hidden and slightly right
            animate={{ opacity: 1, x: 0 }} // Fade in and move to position
            transition={{ duration: 1, ease: "easeOut" }} // Smooth transition
            >
            <img src={CSWD} alt="Fitness" className="image" />
            </motion.div>
        </div>
      </div>
    );
  };
  
  export default Login;
  