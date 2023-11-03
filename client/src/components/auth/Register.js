import { useState, useEffect } from "react";
import { baseURL } from "../config/baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./styles.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNameExist, setIsNameExist] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
       (async () => {
            await axios.get(`${baseURL}/auth/username/${name}`)
            .then((res) => {
                setIsNameExist(true);
            })
            .catch((err) => { 
                console.log(err);
                setIsNameExist(false);
            });
        })();
    }, [name]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email");
        return;
    }
    

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const user = {
        name,
        email,
        password
    }

    try {
        const res = await axios.post(`${baseURL}/auth/register`, user);
        console.log(res.data);
        navigate("/login");
    } catch (error) {
        console.log(error);
        alert("Something went wrong");
    }
    };


  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> Register </span>

            <span className="login-form-title">
                <p style={{ fontSize: "12px", color: "grey", textAlign: "center", marginTop: "10px" }}>
                    Please enter name, email and password to register
                </p>
            </span>

            <div className="wrap-input">
                <input
                    className={name !== "" ? "has-val input" : "input"}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    
                />
                <span className="focus-input" data-placeholder="Name"></span>
                {isNameExist && <span style={{ color: "red", fontSize: "12px" }}>Name already exists</span>}
            </div>

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

            <div className="wrap-input">
                <input
                    className={confirmPassword !== "" ? "has-val input" : "input"}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span className="focus-input" data-placeholder="Confirm Password"></span>
            </div>


            <div className="container-login-form-btn">
              <button className="login-form-btn" onClick={handleSubmit}>Register</button>
            </div>

            <div className="text-center">
              <span className="txt1">Already have an account?</span>
              <a className="txt2" href="/login">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
