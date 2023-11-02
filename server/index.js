
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const axios = require('axios');
require("dotenv").config();


const app = express();
const server = http.createServer(app)
const io = socketIO(server);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
}));




const table1 = `
  CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_banned BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const table2 = `
  CREATE TABLE IF NOT EXISTS channels (
    channel_id CHAR(36) PRIMARY KEY,
    channel_name VARCHAR(50) UNIQUE NOT NULL,
    created_by CHAR(36) NOT NULL,
    num_users INT NOT NULL DEFAULT 0,
    users_limit INT NOT NULL DEFAULT 0,
    active_users INT NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL DEFAULT 'public',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
  );
`;

const table3 = `
  CREATE TABLE IF NOT EXISTS user_channel (
    channel_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
  );
`;



const table4 = `
  CREATE TABLE IF NOT EXISTS messages (
    message_id CHAR(36) PRIMARY KEY,
    channel_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reply_to CHAR(36) DEFAULT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES messages(message_id) ON DELETE CASCADE
  );
`;

const table5 = `
  CREATE TABLE IF NOT EXISTS join_requests (
    request_id CHAR(36) PRIMARY KEY,
    channel_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );
`;





app.get('/', (req, res) => {
  res.send('Hello World!');
});


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
  connection.query('CREATE DATABASE IF NOT EXISTS chatroom', (err, result) => {
    if (err) {
      console.log('Error creating database: ' + err.stack);
      return;
    }
    console.log('Database created successfully.');
    connection.query('USE chatroom', (err, result) => {
      if (err) {
        console.log('Error using database: ' + err.stack);
        return;
      }
      console.log('Using database.');
      connection.query(table1, (err, result) => {
        if (err) {
          console.log('Error creating table: ' + err.stack);
          return;
        }
        console.log('Table 1 created successfully.');
      });
      connection.query(table2, (err, result) => {
        if (err) {
          console.log('Error creating table: ' + err.stack);
          return;
        }
        console.log('Table 2 created successfully.');
      });
      connection.query(table3, (err, result) => {
        if (err) {
          console.log('Error creating table: ' + err.stack);
          return;
        }
        console.log('Table 3 created successfully.');
      });
      connection.query(table4, (err, result) => {
        if (err) {
          console.log('Error creating table: ' + err.stack);
          return;
        }
        console.log('Table 4 created successfully.');
      });
      connection.query(table5, (err, result) => {
        if (err) {
          console.log('Error creating table: ' + err.stack);
          return;
        }
        console.log('Table 5 created successfully.');
      });
    });
  });
});







// listen for incoming socket connections
io.on('connection', (socket) => {
  console.log(`${socket.id} a user connected`);

  socket.on('join', async (doc) => {

    console.log('joined channel: ' + JSON.stringify(doc));
    console.log('socket id: ' + socket.id);
    await axios.post(`http://localhost:5000/api/joinchannel`, {
      channel_id: doc.channel_id,
      user_id: doc.user_id
    })
    .then((res) => {
      console.log('joined channel: ' + JSON.stringify(res.data));

      connection.query('SELECT * FROM channels WHERE channel_id = ?', [doc.channel_id], (err, result) => {
        if (err) {
          console.log('error getting channel: ' + err);
        }
        console.log('channel: ' + JSON.stringify(result));
        socket.join(doc.channel_id);
        socket.emit('joined', result[0]);
      })
      
    })
    .catch((err) => {
      console.log('error joining channel: ' + err);
    });

    connection.query('SELECT * FROM user_channel WHERE channel_id = ?', [doc.channel_id], (err, result) => {
      if (err) {
        console.log('error getting users in channel: ' + err);
      }
      console.log('users in channel: ' + JSON.stringify(result));
      socket.join(doc.channel_id);
     
      io.to(doc.channel_id).emit('message', {
        user_id: doc.user_id,
        message: `${doc.name} has joined the channel.`,
        channel_id: doc.channel_id,
        type: 'bubble'
      });
    });

    connection.query('SELECT * FROM user_channel WHERE channel_id = ?', [doc.channel_id], (err, result) => {
      if (err) {
        console.log('error getting users in channel: ' + err);
      }
      console.log('users in channel: ' + JSON.stringify(result));
      socket.join(doc.channel_id);
      socket.emit('channelData', result);
    });



  });

  socket.on('leave', async (doc) => {
    console.log('leaved channel: ' + JSON.stringify(doc));
    console.log('socket id: ' + socket.id);
    await axios.post(`http://localhost:5000/api/leavechannel`, {
      channel_id: doc.channel_id,
      user_id: doc.user_id
    })
    .then((res) => {
      console.log('leaved channel: ' + JSON.stringify(res.data));

      connection.query('SELECT * FROM channels WHERE channel_id = ?', [doc.channel_id], (err, result) => {
        if (err) {
          console.log('error getting channel: ' + err);
        }
        console.log('channel: ' + JSON.stringify(result));
        socket.join(doc.channel_id);
        socket.emit('leaved', result[0]);
      })
      
    })
    .catch((err) => {
      console.log('error leaving channel: ' + err);
    });

    connection.query('SELECT * FROM user_channel WHERE channel_id = ?', [doc.channel_id], (err, result) => {
      if (err) {
        console.log('error getting users in channel: ' + err);
      }
      console.log('users in channel: ' + JSON.stringify(result));
      socket.join(doc.channel_id);
     
      io.to(doc.channel_id).emit('message', {
        user_id: doc.user_id,
        message: `${doc.name} has leaved the channel.`,
        channel_id: doc.channel_id,
        type: 'bubble'
      });
    });

    connection.query('SELECT * FROM user_channel WHERE channel_id = ?', [doc.channel_id], (err, result) => {
      if (err) {
        console.log('error getting users in channel: ' + err);
      }
      console.log('users in channel: ' + JSON.stringify(result));
      socket.join(doc.channel_id);
      socket.emit('channelData', result);
    });


  });

  socket.on('message', async (data) => {
    console.log('message: ' + data.message);
    socket.join(data.channel_id);
    await axios.post(`http://localhost:5000/api/sendmessage`, {
      channel_id: data.channel_id,
      user_id: data.user_id,
      user_name: data.user_name,
      message: data.message,
      reply_to: data.reply_to
    })
    .then((res) => {
      console.log('message sent: ' + JSON.stringify(res.data));
      io.to(data.channel_id).emit('message', res.data?.message);
    })
    .catch((err) => {
      console.log('error sending message: ' + err);
      io.to(data.channel_id).emit('message', {
        user_id: data.user_id,
        message: 'Error sending message.',
        channel_id: data.channel_id,
        type: 'bubble'
      });
    });
  });

  socket.on('deleteMessage', async (data) => {
    console.log('deleteMessage: ' + JSON.stringify(data));
    socket.join(data.channel_id);
    await axios.post(`http://localhost:5000/api/deletemessage`, {
      message_id: data.message_id
    })
    .then((res) => {
      console.log('message deleted: ' + JSON.stringify(res.data));
      io.to(data.channel_id).emit('deleteMessage', data);
    })
    .catch((err) => {
      console.log('error deleting message: ' + err);
      io.to(data.channel_id).emit('deleteMessage', {
        user_id: data.user_id,
        message: 'Error deleting message.',
        channel_id: data.channel_id,
        type: 'bubble',
        message_id: data.message_id + '1'
      });
    });
  });


  socket.on('typing', (data) => {
    console.log('typing: ' + JSON.stringify(data));
    socket.join(data.channel_id);
    io.to(data.channel_id).emit('typing', data);
  });



  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

  


app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));


//Allow access Post, Put, Delete and Patch
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});