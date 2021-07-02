// Gettin Express
const express = require("express");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

// Setting Up Server
const app = express();
const httpServer = require("http").createServer(app);

// Adding Cors
const cors = require("cors");

// Setting Up io from socket.io
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Setting Up PORT as 5000
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Running");
});

const users = {};

const socketToRoom = {};

const socketToName = {};

io.on("connection", (socket) => {
  console.log("User Entered");

  socket.on("join room", ({ roomID, userName }) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 5) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }

    socketToRoom[socket.id] = roomID;
    socketToName[socket.id] = userName;

    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    console.log(`socketToName on Join :`, socketToName);
    socket.emit("all users", { users: usersInThisRoom, socketToName });
  });
  socket.on("video change", ({ roomID, userName }) => {
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all users", { users: usersInThisRoom, socketToName });
  });
  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      payload: {
        signal: payload.signal,
        callerID: payload.callerID,
      },
      socketToName,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("User Left");

    const roomID = socketToRoom[socket.id];
    delete socketToName[socket.id];

    let room = users[roomID];

    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }

    socket.broadcast.emit("user left", socket.id);

    console.log(`socketToName on Left :`, socketToName);
  });
});

// Establishing Connection from

httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
