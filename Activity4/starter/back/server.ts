import * as argon2 from "argon2";
import crypto from "crypto";
import sqlite3 from "sqlite3";
import * as sqlite from "sqlite";
import * as url from "url";
import express, {
    Request,
    Response,
    RequestHandler,
    CookieOptions,
} from "express";
import { z } from "zod";
import cookieParser from "cookie-parser";
import { EmptyResponse, MessageResponse } from "./types.js";
import path from "path";
import process from "process";

let __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let app = express();
app.use(cookieParser());
app.use(express.json());

let dbfile = path.resolve(__dirname, "..", "database.db");
let db = await sqlite.open({
    filename: dbfile,
    driver: sqlite3.Database,
});

let loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}

// e.g. { "z7fsga": { username: "mycoolusername" } }
let tokenStorage: { [key: string]: { username: string } } = {};

// need to use same options when creating and deleting cookie
// or cookie won't be deleted
let cookieOptions: CookieOptions = {
    httpOnly: true, // JS can't access it
    secure: true, // only sent over HTTPS connections
    sameSite: "strict", // only sent to this domain
};

async function login(req: Request, res: Response<MessageResponse>) {
    let parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res
            .status(400)
            .json({ message: "Username or password invalid" });
    }
    let { username, password } = parseResult.data;
    console.log(parseResult.data);
    console.log(username, password);

    let info = await db.all("SELECT * FROM users WHERE username = ?", username)
    console.log(info);
    

    // TODO log user in if credentials valid
    // use argon2 to hash the password
    // https://github.com/ranisalt/node-argon2
    // https://expressjs.com/en/api.html#res.cookie
    // TIP make sure to pass cookieOptions when creating cookie
    try{
        const hashPass = await argon2.verify(info[0].password, password);
        console.log("Got here " + hashPass);
        if(hashPass){
            let token = makeToken();
            let hold = { tok: {username: username}}
            tokenStorage[token] = { username: username}
            return res.status(200).cookie("token", token, cookieOptions).send();
        } else {
            return res.sendStatus(400);
        }
    } catch{
        return res.json({message: "Login Failed"}).sendStatus(400);
    }

    
    return res.json({ message: "Success" });
}

async function logout(req: Request, res: Response<EmptyResponse>) {
    let { token } = req.cookies;
    if (token === undefined) {
        // already logged out
        return res.sendStatus(401);
    }
    if (!tokenStorage.hasOwnProperty(token)) {
        // token invalid
        return res.sendStatus(402);
    }
    delete tokenStorage[token];
    return res.clearCookie("token", cookieOptions).send();
}

let authorize: RequestHandler = (req, res, next) => {
    console.log("Authorize ran");
    console.log(req.cookies);
    let {token} = req.cookies;
    if (token === undefined) {
        // already logged out
        return res.sendStatus(401);
    }
    if (!tokenStorage.hasOwnProperty(token)) {
        // token invalid
        return res.sendStatus(402);
    }
    // TODO only allow access if user logged in
    // by sending error response if they're not
    next();
};

function publicAPI(req: Request, res: Response<MessageResponse>) {
    return res.json({ message: "A public message" });
}
function privateAPI(req: Request, res: Response<MessageResponse>) {
    return res.json({ message: "A private message" });
}

app.post("/api/login", login);
app.post("/api/logout", logout);
app.get("/api/public", publicAPI);
app.get("/api/private", authorize, privateAPI);

// https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing
// only do this when deploying in "production" mode
// because ts-watch will delete built react assets during dev mode
// and we'll get annoying console errors about public not existing
if (process.env.PROD === "1") {
    app.use(express.static(path.join(__dirname, "public")));
    app.get("/*", function (req, res) {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });
}

let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
