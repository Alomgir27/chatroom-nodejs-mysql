const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { promisify } = require("util");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();


const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    db.query("SELECT email FROM users WHERE email = ?", [email], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results?.length > 0) {
            return res.status(400).json({
                message: "That email is already in use"
            });
        }

       
        let hashedPassword = await bcrypt.hash(password, 8);

        db.query("INSERT INTO users SET ?", {user_id: uuidv4(), name: name, email: email, password: hashedPassword, is_admin: process.env.ADMIN_EMAIL === email ? 1 : 0}, (error, results) => {
            if(error) {
                console.log(error);
            } else {
                console.log(results);
                return res.status(200).json({
                    message: "User registered"
                });

            }
        });
    });
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(req.body);

        if(!email || !password) {
            return res.status(400).json({
                message: "Please provide an email and password"
            });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (error, results) => {
            console.log(results);
            if(!results || results.length === 0 || !(await bcrypt.compare(password, results[0]?.password))) {
                return res.status(401).json({
                    message: "Email or password is incorrect"
                });
            } 
            else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie("jwt", token, cookieOptions);
                res.status(200).json({
                    message: "Successfully logged in",
                    token: token,
                    user: results[0]
                });
                

               
            }
        });
    } catch (error) {
        console.log(error);
    }
});


router.get("/username/:name", async (req, res) => {
    const { name } = req.params;
    console.log(req.params);

    db.query("SELECT name FROM users WHERE name = ?", [name], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results?.length > 0) {
            return res.status(200).json({
                message: "That username is already in use"
            });
        } else {
            return res.status(400).json({
                message: "Username is available"
            });
        }
    });
});

router.get("/logout", (req, res) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        message: "Logged out"
    });
});

module.exports = router;

        
