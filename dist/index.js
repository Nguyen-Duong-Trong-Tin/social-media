"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
app.use(bodyParser.urlencoded({ extended: false }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express_1.default.static("public"));
app.set("views", "./views");
app.set("view engine", "pug");
// Routes
const index_route_1 = __importDefault(require("./routes/admin/index.route"));
(0, index_route_1.default)(app);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
});
