// require những module cần thiết
const express = require("express");
const path = require("path");
const app = express();

// tạo server
const server = require("http").createServer(app);

// tạo io
const io = require("socket.io")(server);

// router đến file chat-app.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/chat-app.html'));
});

// app.get("/:id",(req, res) => {
//     res.sendFile(path.join(__dirname, '/private-chat.html'));
// });

// khai báo mảng list user để lưu thông tin của tất cả user
var listUsers = [];

// mở kết nối với io.on
io.on("connection", (socket) => {
    // server lắng nghe sự kiện join
    socket.on("join", (data) => {
        console.log("User: " + data.username + " joined " + data.room);

        // đẩy dữ liệu vào mảng list user
        listUsers.push({
            id: socket.id,
            username: data.username,
            room: data.room
        });
        // tham gia vào phòng với đúng room-id
        socket.join(data.room);

        // lấy ra danh sách user cùng thuộc 1 room
        let user_room = listUsers.filter(user => user.room === data.room);

        // phát thông tin đến room theo đúng room-id, theo sự kiện user_join
        io.to(data.room).emit("user_join", user_room);

        // phát message có người tham gia vào, theo sự kiện send
        io.to(data.room).emit("send", "<small class='text-danger'>System: " + data.username + " joined " + data.room + "</small>");
        
        // server lắng nghe sự kiện send-mess, sau đó lại phát ra message theo sự kiện send
        socket.on("send-mess", (mess) => {
            io.to(data.room).emit("send", `${data.username}: ${mess.content}`)
        });
        // server lắng nghe sự kiện disconnect khi có người rời phòng chat
        socket.on("disconnecting", () => {
            // phát message có người thoát server
            listUsers = listUsers.filter(user => user.id !== socket.id);
            user_room = listUsers.filter(user => user.room === data.room);

            io.to(data.room).emit("user_join", user_room);
            io.to(data.room).emit("send", "<small class='text-danger'>System: " +data.username + " left the room</small>"); 
        });
    });

    // Đây là phần test =))))
    // server lắng nghe sự kiện disconnect khi có người rời phòng chat
    socket.on("disconnecting", () => {
        console.log("Left: " + socket.id);
    });
});


server.listen(3000, () =>{
    console.log(`App listening on: http://localhost:3000`);
});