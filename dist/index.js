"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_config_1 = __importDefault(require("./configs/database.config"));
database_config_1.default.connect();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
app.use(cookieParser("ABCXYZ"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
const moment = require("moment");
global.moment = moment;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "pug");
// cors
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
// routes
const index_route_1 = __importDefault(require("./routes/admin/index.route"));
(0, index_route_1.default)(app);
const index_route_2 = __importDefault(require("./routes/client/index.route"));
(0, index_route_2.default)(app);
// socket
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const clients_1 = __importDefault(require("./sockets/clients"));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
io.on("connection", (socket) => {
    try {
        clients_1.default.register(socket, io);
    }
    catch (error) {
        console.log("Socket Error", socket);
    }
});
const port = process.env.PORT;
httpServer.listen(port, () => {
    console.log(`Http service is listening on port http://localhost:${port}/admin`);
});
