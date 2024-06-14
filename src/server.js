import express from "express"
// import WebSocket from "ws";
import { Server } from "socket.io";
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
const socketServer = new Server(httpServer);

socketServer.on("connection", (socket) =>{
    // console.log(socket);
    socket.onAny((event)=>{
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomName,done) => {
        // console.log(roomName);
        // console.log(socket.rooms)
        socket.join(roomName)
        // console.log(socket.rooms)
        done()
    })
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