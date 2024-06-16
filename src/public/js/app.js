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

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value,roomName, ()=>{
        addMessage(`You : ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value)
}

function showRoom() {
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const nameForm = room.querySelector("#name");
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value,showRoom)
    roomName=input.value;
    input.value = "";
}

form.addEventListener("submit",handleRoomSubmit);

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

socket.on("welcome", (user,newCount) =>{
    addMessage(`${user}님이 방에 들어왔습니다!`)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount}명 참가중)`;
})

socket.on("bye", (user,newCount) =>{
    addMessage(`${user}님이 방에서 나갔습니다.`)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount}명 참가중)`;
})

socket.on("new_message",addMessage);

socket.on("room_change",(rooms) =>{
    const roomList = welcome.querySelector("ul");
    if(rooms.length === 0){
        roomList.innerText = "";
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText=room;
        roomList.append(li);
    });
});