import express from "express"
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));

const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

const handleListen = () => console.log(`Linstening on http://localhost:3000`);
httpServer.listen(3000,handleListen);