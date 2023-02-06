const express = require("express");
const path = require("path");
const app = express();

const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/chat-app.html'));
});

var listUsers = [];

var rooms = [
    {
        id: "room-1",
        name: "Mystical Minds"
    },
    {
        id: "room-2",
        name: "The Unusual Suspects"
    },
    {
        id: "room-3",
        name: "The Bizarre Bunch"
    },
    {
        id: "room-4",
        name: "The Odd Squad"
    }
];


io.on("connection", (socket) => {
    socket.on("join", (data) => {
        console.log("User: " + data.username + " joined " + data.room);
        listUsers.push({
            id: socket.id,
            username: data.username,
            room: data.room
        });

        socket.join(data.room);
        let user_room = listUsers.filter(user => user.room === data.room);

        io.to(data.room).emit("user_join", user_room);
        io.to(data.room).emit("send", "<small class='text-danger'>System: " + data.username + " joined " + data.room + "</small>");
        socket.on("send-mess", (mess) => {
            io.to(data.room).emit("send", `${data.username}: ${mess.content}`)
        });
        socket.on("disconnecting", () => {
            io.to(data.room).emit("send", "<small class='text-danger'>System: " +data.username + " left</small>"); 
        });
    });

    socket.on("disconnecting", () => {
        console.log("Left: " + socket.id);
    });
});


server.listen(3000, () =>{
    console.log(`App listening on: http://localhost:3000`);
})