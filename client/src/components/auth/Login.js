import { useState } from "react";

import { baseURL } from "../config/baseURL";
import axios from "axios";

import { useNavigate } from "react-router-dom";

import "./styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = {
            email,
            password
        }

        try {
            await axios.post(`${baseURL}/auth/login`, user)
            .then((res) => {
                console.log(res)
                localStorage.setItem("token", res?.data?.token);
                localStorage.setItem("user", JSON.stringify(res?.data?.user));
                navigate("/chatroom");
            })


        } catch (error) {
            console.log(error);
            alert("Invalid email or password");
        }
    };


  

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> Login </span>

            <span className="login-form-title">
                <p style={{ fontSize: "12px", color: "grey", textAlign: "center", marginTop: "10px" }}>
                    Please enter your email and password to login
                </p>
            </span>

            <div className="wrap-input">
              <input
                className={email !== "" ? "has-val input" : "input"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Email"></span>
            </div>

            <div className="wrap-input">
              <input
                className={password !== "" ? "has-val input" : "input"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Password"></span>
            </div>

            <div className="container-login-form-btn">
              <button className="login-form-btn" onClick={handleSubmit}>
                Login
                </button>
            </div>

            <div className="text-center">
              <span className="txt1">Don't have an account?</span>
              <a className="txt2" href="/register">
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
