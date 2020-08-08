const path = require("path");
const http = require("http");
const express = require("express");
const {
  generatedMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom,
} = require("./utils/users");
const Filter = require("bad-words");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));
io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      generatedMessage("Admin", "Welcome, " + user.username + "!!!")
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generatedMessage("Admin", user.username + " has joined!")
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersinRoom(user.room),
    });
    callback();
    //socket.emit = emit message to specific client
    //io.emit =  emit message to all the client
    //socket.broadcast.emit = emit message to all the clients except the root client

    //io.to.emit = emits events to all the client in a room
    //socket.broadcast.to.emit = emit message to all the clients except the root client of a room
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) return callback("Profanity not allowed");
    if (user) {
      io.to(user.room).emit(
        "message",
        generatedMessage(user.username, message)
      );
      callback();
    } else callback({ error: "Please join again!!" });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generatedMessage("Admin", user.username + " has left!")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersinRoom(user.room),
      });
    }
  });
  socket.on("location", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    if (user)
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          "https://google.com/maps?q=" + latitude + "," + longitude
        )
      );
    callback("location shared");
  });
});

server.listen(3000, () => {
  console.log("Serving at port" + port);
});
