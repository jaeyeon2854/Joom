// websocket 코드
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`wss://${window.location.host}`);

// function makeMessage(type,payload) {
//     const msg = {type, payload}
//     return JSON.stringify(msg);
// }

// function handleOpen() {
//     console.log("Connected to Server ✅");
// }

// socket.addEventListener("open",handleOpen)

// socket.addEventListener("message",(message)=>{
//     // console.log("New Message: ",message.data, "from the Server");
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// })

// socket.addEventListener("close",()=>{
//     console.log("Disconnected from the Server ❌");
// })

// // setTimeout(()=> {
// //     socket.send("hello from the browser!");
// // },10000)

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     // console.log(input.value);
//     socket.send(makeMessage("new_message",input.value));
//     input.value = "";
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname",input.value));
//     input.value = "";
// }

// nickForm.addEventListener("submit",handleNickSubmit)
// messageForm.addEventListener("submit",handleSubmit)

const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = document.querySelector("form");

room.hidden=true;

let roomName;

function showRoom() {
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", {payload : input.value},showRoom)
    roomName=input.value;
    input.value = "";
}

form.addEventListener("submit",handleRoomSubmit);