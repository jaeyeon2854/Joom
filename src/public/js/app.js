const messageUl = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open",()=>{
    console.log("Connected to Server ✅");
})

socket.addEventListener("message",(message)=>{
    console.log("New Message: ",message.data, "from the Server");
})

socket.addEventListener("close",()=>{
    console.log("Disconnected from the Server ❌");
})

// setTimeout(()=> {
//     socket.send("hello from the browser!");
// },10000)

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    // console.log(input.value);
    socket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit",handleSubmit)