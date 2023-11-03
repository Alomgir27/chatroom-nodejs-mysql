const express = require("express");
const mysql = require("mysql2");
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");
require("dotenv").config();


const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});





///////////////////////// POST REQUESTS //////////////////////////


router.post("/createchannel", async (req, res) => {
    const { channel_name, created_by, limit, type } = req.body;
    console.log(req.body);

    db.query("SELECT channel_name FROM channels WHERE channel_name = ?", [channel_name], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(401).json({
                message: "That channel name is already in use"
            });
        }
        const channel_id = uuidv4();

        db.query("INSERT INTO channels SET ?", { channel_id: channel_id, channel_name: channel_name, created_by: created_by, users_limit: limit, type: type }, (error, results) => {
            if(error) {
                console.log(error);
            } else {
                console.log(results);
                db.query("SELECT * FROM channels WHERE channel_id = ?", [channel_id], async (error, results) => {
                    if(error) {
                        console.log(error);
                    }

                    if(results.length > 0) {
                        const channel = results[0];

                        return res.status(200).json({
                            message: "Channel created",
                            channel: channel
                        });
                    } else {
                        return res.status(401).json({
                            message: "Channel not found"
                        });
                    }
                });
            }
        });
    });
});


router.post("/joinchannel", async (req, res) => {
    const { channel_id, user_id } = req.body;
    console.log(req.body);

    db.query("SELECT * FROM channels WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            const channel = results[0];
            const channel_limit = channel.limit;

            db.query("SELECT * FROM user_channel WHERE channel_id = ?", [channel_id], async (error, results) => {
                if(error) {
                    console.log(error);
                }

                if(results.length > 0) {
                    const users = results;
                    const users_count = users.length;

                    if(users_count >= channel_limit) {
                        return res.status(401).json({
                            message: "Channel is full"
                        });
                    } else {
                        db.query("SELECT * FROM user_channel WHERE channel_id = ? AND user_id = ?", [channel_id, user_id], async (error, results) => {
                            if(error) {
                                console.log(error);
                            }

                            if(results.length > 0) {
                                return res.status(401).json({
                                    message: "You are already in this channel"
                                });
                            } else {
                                console.log("Test 2", channel.created_by, user_id, channel.created_by === user_id, channel, users_count);
                                db.query("UPDATE channels SET num_users = ? WHERE channel_id = ?", [users_count + 1, channel_id], (error, results) => {
                                    if(error) {
                                        console.log(error);
                                    } else {
                                        console.log(results);
                                    }
                                });
                                db.query("INSERT INTO user_channel SET ?", { channel_id: channel_id, user_id: user_id, is_admin: user_id === channel.created_by }, (error, results) => {
                                    if(error) {
                                        console.log(error);
                                    } else {
                                        console.log(results);
                                        return res.status(200).json({
                                            message: "Joined channel successfully"
                                        });
                                    }
                                });
                            }
                        });
                    }
                } else {
                    console.log("test 2", channel.created_by, user_id, channel.created_by === user_id, channel);
                    db.query("UPDATE channels SET num_users = ? WHERE channel_id = ?", [channel.num_users + 1, channel_id], (error, results) => {
                        if(error) {
                            console.log(error);
                        } else {
                            console.log(results);
                        }
                    });
                    db.query("INSERT INTO user_channel SET ?", { channel_id: channel_id, user_id: user_id, is_admin: user_id === channel.created_by }, (error, results) => {
                        if(error) {
                            console.log(error);
                        } else {
                            console.log(results);
                            return res.status(200).json({
                                message: "Joined channel successfully"
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(401).json({
                message: "Channel not found"
            });
        }
    });
});


router.post("/leavechannel", async (req, res) => {
    const { channel_id, user_id } = req.body;
    console.log(req.body);

    db.query("SELECT * FROM user_channel WHERE channel_id = ? AND user_id = ?", [channel_id, user_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            db.query("DELETE FROM user_channel WHERE channel_id = ? AND user_id = ?", [channel_id, user_id], async (error, results) => {
                if(error) {
                    console.log(error);
                } else {
                    db.query("SELECT * FROM user_channel WHERE channel_id = ?", [channel_id], async (error, results) => {
                        if(error) {
                            console.log(error);
                        } else {
                            const users_count = results.length;
                            db.query("UPDATE channels SET num_users = ? WHERE channel_id = ?", [users_count, channel_id], (error, results) => {
                                if(error) {
                                    console.log(error);
                                } else {
                                    console.log(results);
                                    return res.status(200).json({
                                        message: "Left channel successfully"
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(401).json({
                message: "You are not in this channel"
            });
        }
    });
});



router.post("/sendmessage", async (req, res) => {
    const { channel_id, user_id, message, reply_to, user_name } = req.body;
    const message_id = uuidv4();

    db.query("INSERT INTO messages SET ?", { message_id: message_id, channel_id: channel_id, user_id: user_id, message: message, reply_to: reply_to, user_name: user_name }, (error, results) => {
        if(error) {
            console.log(error);
        } else {
            console.log(results);
            db.query("SELECT * FROM messages WHERE message_id = ?", [message_id], async (error, results) => {
                if(error) {
                    console.log(error);
                }

                if(results.length > 0) {
                    return res.status(200).json({
                        message: "Message sent",
                        message: results[0]
                    });
                } else {
                    return res.status(401).json({
                        message: "Message not sent"
                    });
                }
            });
        }
    });
});


router.post("/joinrequest", async (req, res) => {
    const { channel_id, user_id, user_name } = req.body;
    const request_id = uuidv4();

    db.query("SELECT * FROM channels WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            const channel = results[0];
            if(channel.type === "private") {
                db.query("SELECT * FROM user_channel WHERE channel_id = ? AND user_id = ?", [channel_id, user_id], async (error, results) => {
                    if(error) {
                        console.log(error);
                    }
                    
                    if(results.length > 0) {
                        return res.status(401).json({
                            message: "You are already in this channel"
                        });
                    } else {
                        db.query("SELECT * FROM join_requests WHERE channel_id = ? AND user_id = ?", [channel_id, user_id], async (error, results) => {
                            if(error) {
                                console.log(error);
                            }
                            
                            if(results.length > 0) {
                                return res.status(401).json({
                                    message: "You have already sent a join request"
                                });
                            } else {
                                db.query("INSERT INTO join_requests SET ?", { request_id: request_id, channel_id: channel_id, user_id: user_id, user_name: user_name }, (error, results) => {
                                    if(error) {
                                        console.log(error);
                                    } else {
                                        console.log(results);
                                        return res.status(200).json({
                                            message: "Join request sent"
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(401).json({
                    message: "Channel is not private"
                });
            }
        } else {
            return res.status(401).json({
                message: "Channel not found"
            });
        }
    });
});


router.post("/joinrequests/accept", async (req, res) => {
    const { request_id, channel_id, user_id } = req.body;
    console.log(req.body);

    db.query("SELECT * FROM join_requests WHERE request_id = ?", [request_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            axios.post("http://localhost:5000/api/joinchannel", {
                channel_id: channel_id,
                user_id: user_id
            }).then((response) => {
                console.log(response.data);
                db.query("DELETE FROM join_requests WHERE request_id = ?", [request_id], async (error, results) => {
                    if(error) {
                        console.log(error);
                    } else {
                        return res.status(200).json({
                            message: "Join request accepted"
                        });
                    }
                });
            }).catch((error) => {
                console.log(error);
            });
        } else {
            return res.status(401).json({
                message: "Join request not found"
            });
        }
    });
});
           

router.post("/deleteMessage", async (req, res) => {
    const { message_id } = req.body;
    console.log(req.body);

    db.query("SELECT * FROM messages WHERE message_id = ?", [message_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            db.query("DELETE FROM messages WHERE message_id = ?", [message_id], async (error, results) => {
                if(error) {
                    console.log(error);
                } else {
                    return res.status(200).json({
                        message: "Message deleted"
                    });
                }
            });
        } else {
            return res.status(401).json({
                message: "Message not found"
            });
        }   
    });
});




////////////////////////// GET REQUESTS //////////////////////////


router.get("/channel/:channel_name", async (req, res) => {
    const { channel_name } = req.params;
    console.log(req.params);

    db.query("SELECT * FROM channels WHERE channel_name = ?", [channel_name], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "Channel found",
                channel: results[0]
            });
        } else {
            return res.status(401).json({
                message: "Channel not found"
            });
        }
    });
});


router.get("/channels", async (req, res) => {
    db.query("SELECT * FROM channels", async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            let channels = results;
            channels.sort((a, b) => (a.date_created < b.date_created) ?  1 : -1);
            return res.status(200).json({
                message: "Channels found",
                channels: results
            });
        } else {
            return res.status(401).json({
                message: "No channels found"
            });
        }
    });
});


    

router.get("/messages/:channel_id", async (req, res) => {
    const { channel_id } = req.params;
    db.query("SELECT * FROM messages WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            let messages = results;
            messages.sort((a, b) => (a.date_created > b.date_created) ?  1 : -1);
            return res.status(200).json({
                message: "Messages found",
                messages: messages
            });
        } else {
            return res.status(401).json({
                message: "No messages found"
            });
        }
    });
});


router.get("/channelusers/:channel_id", async (req, res) => {
    const { channel_id } = req.params;
    db.query("SELECT * FROM user_channel WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            let users = [];
            for(let i = 0; i < results.length; i++) {
                const user_id = results[i].user_id;

                db.query("SELECT * FROM users WHERE user_id = ?", [user_id], async (error, result) => {
                    if(error) {
                        console.log(error);
                    }

                    if(results.length > 0) {
                        users.push({
                            ...result[0],
                            is_chatroom_admin: results[i].is_admin,
                            is_chatroom_moderator: results[i].is_moderator
                        });
                        if(i === results.length - 1) {
                            return res.status(200).json({
                                message: "Users found",
                                users: users
                            });
                        }
                    } else {
                        return res.status(401).json({
                            message: "No users found"
                        });
                    }
                });
            }
        } else {
            return res.status(401).json({
                message: "No users found"
            });
        }
    });
});

router.get("/message/:message_id", async (req, res) => {
    const { message_id } = req.params;
    db.query("SELECT * FROM messages WHERE message_id = ?", [message_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "Message found",
                message: results[0]
            });
        } else {
            return res.status(401).json({
                message: "No message found"
            });
        }
    });
});



router.get("/allmessages", async (req, res) => {
    db.query("SELECT * FROM messages", async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
           return res.status(200).json({
                message: "Messages found",
                messages: results
            });
        } else {
            return res.status(401).json({
                message: "No messages found"
            });
        }
    });
});


router.get("/channelsusers", async (req, res) => {
    db.query("SELECT * FROM user_channel", async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "Users found",
                users: results
            });
        } else {
            return res.status(401).json({
                message: "No users found"
            });
        }
    });
});


router.get("/user/:user_id", async (req, res) => {
    const { user_id } = req.params;
    db.query("SELECT * FROM users WHERE user_id = ?", [user_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "User found",
                user: results[0]
            });
        } else {
            return res.status(401).json({
                message: "No user found"
            });
        }
    });
});


router.get("/joinrequests/:channel_id", async (req, res) => {
    const { channel_id } = req.params;
    db.query("SELECT * FROM join_requests WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "Join requests found",
                join_requests: results
            });
        } else {
            return res.status(401).json({
                message: "No join requests found"
            });
        }
    });
});

////////////////////////// DELETE REQUESTS //////////////////////////

router.delete("/channel/:channel_id", async (req, res) => {
    const { channel_id } = req.params;
    db.query("DELETE FROM messages WHERE channel_id = ?", [channel_id], async (error, results) => {
        if(error) {
            console.log(error);
        } else {
            db.query("DELETE FROM user_channel WHERE channel_id = ?", [channel_id], async (error, results) => {
                if(error) {
                    console.log(error);
                } else {
                    db.query("DELETE FROM channels WHERE channel_id = ?", [channel_id], async (error, results) => {
                        if(error) {
                            console.log(error);
                        } else {
                            return res.status(200).json({
                                message: "Channel deleted"
                            });
                        }
                    });
                }
            });
        }
    });
});




////////////////////////// Search Routes //////////////////////////

router.get("/search/:search", async (req, res) => {
    const { search } = req.params;
    db.query("SELECT * FROM channels WHERE channel_name LIKE ?", ["%" + search + "%"], async (error, results) => {
        if(error) {
            console.log(error);
        }

        if(results.length > 0) {
            return res.status(200).json({
                message: "Channels found",
                channels: results
            });
        } else {
            return res.status(401).json({
                message: "No channels found"
            });
        }
    });
});






module.exports = router;

        
