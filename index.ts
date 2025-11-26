import express, { Express } from "express";
import path from "path";
const app: Express = express();

import dotenv from "dotenv";
dotenv.config();

import database from "./configs/database.config";
database.connect();

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
app.use(cookieParser("ABCXYZ"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

const moment = require("moment");
(global as any).moment = moment;

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// cors
import cors from "cors";
app.use(cors());

// routes
import adminRoutes from "./routes/admin/index.route";
adminRoutes(app);
import clientRoutes from "./routes/client/index.route";
clientRoutes(app);

// socket
import { createServer } from "http";
import { Server } from "socket.io";
import clientSocket from "./sockets/clients";
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  try {
    clientSocket.register(socket, io);
  } catch (error) {
    console.log("Socket Error", socket);
  }
});

const port = process.env.PORT as string;
httpServer.listen(port, () => {
  console.log(
    `Http service is listening on port http://localhost:${port}/admin`
  );
});
