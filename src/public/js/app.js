const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let roomName;
let muted = false;
let cameraOff = false;
let myPeerConnection;

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initalContrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraContrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraContrains : initalContrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCamera();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

call.hidden = true;

const welcomeForm = welcome.querySelector("form");

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}
welcome.addEventListener("submit", handleWelcomeSubmit);

//socket code

// socket.on("welcome", async () => {
//   myDataChannel = myPeerConnection.createDataChannel("chat");
//   myDataChannel.addEventListener("message", (event) => console.log(event.data));
//   console.log("made data channel");
//   const offer = await myPeerConnection.createOffer();
//   myPeerConnection.setLocalDescription(offer);
//   console.log("sent the offer");
//   socket.emit("offer", offer, roomName);
// });

// socket.on("offer", async (offer) => {
//   myPeerConnection.addEventListener("datachannel", (event) => {
//     myDataChannel = event.channel;
//     myDataChannel.addEventListener("message", (event) =>
//       console.log(event.data)
//     );
//   });
//   console.log("received the offer");
//   myPeerConnection.setRemoteDescription(offer);
//   const answer = await myPeerConnection.createAnswer();
//   myPeerConnection.setLocalDescription(answer);
//   socket.emit("answer", answer, roomName);
//   console.log("sent the answer");
// });

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

//RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: ["stun:ntk-turn-1.xirsys.com"] },
      {
        username:
          "qf5ieghRKZYB_sy7QZqccxU4ZHPRb3ujXVq741DJhHkwgFMHmN2qOd41fKajUR9ZAAAAAGZxSitqYWV5ZW9u",
        credential: "b78aac80-2d4f-11ef-ba0f-0242ac120004",
        urls: [
          "turn:ntk-turn-1.xirsys.com:80?transport=udp",
          "turn:ntk-turn-1.xirsys.com:3478?transport=udp",
          "turn:ntk-turn-1.xirsys.com:80?transport=tcp",
          "turn:ntk-turn-1.xirsys.com:3478?transport=tcp",
          "turns:ntk-turn-1.xirsys.com:443?transport=tcp",
          "turns:ntk-turn-1.xirsys.com:5349?transport=tcp",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}

// Data Channel
let myDataChannel;

socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => console.log(event.data));
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
  });
  
  socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
      myDataChannel = event.channel;
      myDataChannel.addEventListener("message", (event) =>
        console.log(event.data)
      );
    });
    console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});
