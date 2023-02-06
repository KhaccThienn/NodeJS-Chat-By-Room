const express = require("express");
const path = require("path");
const app = express();

const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
});

var listUsers = [];

io.on("connection", (socket) => {
    socket.on("join", (data) => {
        console.log("User: " + data.username + " joined " + data.room);
        listUsers.push({
            id: socket.id,
            username: data.username,
            room: data.room
        });

        socket.join(data.room);
        let userroom = listUsers.filter(user => user.room === data.room);
        
        io.to(data.room).emit("user_join", userroom);

        socket.on("send-mess", (mess) => {
            io.to(data.room).emit("send", `${data.username}: ${mess.content}`)
        });
    });

    socket.on("disconnecting", () => {
        console.log("Left: " + socket.id);
    });
});


server.listen(3000, () =>{
    console.log(`App listening on: http://localhost:3000`);
})