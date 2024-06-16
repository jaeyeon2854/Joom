import express from "express"
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// console.log("hello");

app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));
const handleListen = () => console.log(`Linstening on http://localhost:3000`);

const httpServer = http.createServer(app);
const socketServer = new Server(httpServer,
    {cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
      }}
);
instrument(socketServer, {
    auth: false,
    mode: "development",
  });

function publicRooms() {
    const {sockets : {adapter : { sids, rooms}} } = socketServer;
    // const sids =socketServer.sockets.adapter.sids;
    // const rooms = socketServer.sockets.adapter.rooms;
    const publicRooms =[];
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms
}

function countRoom(roomName) {
    return socketServer.sockets.adapter.rooms.get(roomName)?.size;
  }  

socketServer.on("connection", (socket) =>{
    // console.log(socket);
    socket["nickname"] = "익명";
    socket.onAny((event)=>{
        console.log(socketServer.sockets.adapter);
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName,done) => {
        // console.log(roomName);
        // console.log(socket.rooms)
        socket.join(roomName)
        // console.log(socket.rooms)
        done()
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName))
        socketServer.sockets.emit("room_change",publicRooms());
    })
    socket.on("disconnecting",() => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname,countRoom(room) -1))
        socketServer.sockets.emit("room_change",publicRooms());
    })
    socket.on("disconnect",() => {
        socketServer.sockets.emit("room_change",publicRooms());
    })

    socket.on("new_message", (msg,room,done)=>{
        socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);
        done()
    })
    socket.on("nickname", nickname => socket["nickname"] = nickname)
})


// const wss = new WebSocket.Server({server});

//WebSocket 사용 코드
// const sockets = [];

// wss.on("connection",(socket) =>{
//     sockets.push(socket)
//     socket["nickname"] = "anonymous"
//     console.log("Connected to Browser ✅")
//     socket.on("close",()=> console.log("Disconnected from the Browser ❌"))
//     socket.on("message", (msg) =>{
//         // const messageString = message.toString('utf8');
//         const message = JSON.parse(msg);
//         // console.log(message, messageString)

//         // if(message.type ==="new_message"){
//         //     sockets.forEach(aSocket => aSocket.send(message.payload))
//         //     console.log("send_message",message.payload)
//         // }else if(message.type ==="nickname"){
//         //     console.log("nick_name",message.payload)
//         // }

//         switch (message.key) {
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`))
//                 console.log("send_message",message.payload)
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 console.log("nick_name",message.payload)
//         }

//     })
//     // socket.send("hello!")
// })


httpServer.listen(3000,handleListen);