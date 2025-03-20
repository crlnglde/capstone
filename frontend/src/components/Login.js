import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import CSWD from "../pic/cswdlogo.png"

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
      };

    const handleLogin = (e) => {
        e.preventDefault();

        navigate("/home");
    };

    return (
      <div className="login">
        <div className="loginBox">
          <div className="leftPanel">
            <h2 className="title">Log In</h2>
            <p className="subtitle">Please enter your details</p>
            <form className="form" onSubmit={handleLogin}>
                <input type="email" placeholder="Email" className="input" />
                <div className="passwordContainer">
                    <input 
                        type={showPassword ? "text" : "password"} 
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
  