import express from "express";
import * as Sqrl from "squirrelly";

import "dotenv/config";

import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";
import { readFile } from "fs/promises";
const serviceAccount = JSON.parse(
    await readFile(new URL("./admin.json", import.meta.url)),
);
initializeApp({
    credential: cert(serviceAccount),
    databaseURL:
        "https://ossp-53235-default-rtdb.asia-southeast1.firebasedatabase.app",
});
var db = getDatabase();
var auth = getAuth();

const create = async (name, ques) => {
    let data = await db.ref().child("quiz/counter").once("value");
    let counter = data.val();

    let quiz = {
        name: name,
        questions: ques,
    };

    await db.ref(`quiz/quizzes/${counter}`).set(quiz);
    await db.ref("quiz/counter").set(counter + 1);

    return counter;
};

// // testing create function
// let ques = [
//     {
//         correct: 1,
//         options: ["good", "fine", "bad"],
//         text: "how was your day?",
//     },
//     {
//         correct: 0,
//         options: ["good", "fine", "bad"],
//         text: "how are you?",
//     },
// ];
// let name = "test";
// let test = await create(name, ques);
// console.log(`test quiz created with id ${test}`);

const get = async (id) => {
    let data = await db.ref("quiz/quizzes").once("value");
    let quiz = data.val()[id];
    return quiz;
};

// // testing get function
// let id = 3;
// let quiz = await get(id);
// console.log(quiz);

const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        req.authToken = req.headers.authorization.split(" ")[1];
    } else {
        req.authToken = null;
    }
    next();
};

export const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await admin.auth().verifyIdToken(authToken);
            req.authId = userInfo.uid;
            return next();
        } catch (e) {
            return res
                .status(401)
                .send({ error: "You are not authorized to make this request" });
        }
    });
};

const app = express();
const port = process.env.PORT || 8080;

app.set("view engine", "html");
app.engine("html", Sqrl.__express);
app.use(express.static("assets"));

const defaults = {
    imports: [
        "<link rel='preconnect' href='https://fonts.gstatic.com'>",
        "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>",
        "<link href='https://fonts.googleapis.com/css2?family=Poppins&display=swap' rel='stylesheet'>",
        "<script src='htmx.1.9.6.min.js'></script>",
        "<script src='script.js'></script>",
        "<link href='style.css' rel='stylesheet'>",
    ],
    scripts: [""],
};

// app.post("/auth/signup", async (req, res) => {
//     const { email, password } = req.body;
//
//     const user_cred = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password,
//     );
//     console.log(user_cred);
//
//     return res.send(user_cred.user);
// });

app.use(function (req, res, next) {
    req.initial_time = Date.now();
    next();
});

// load html templates from views folder
let wait_html = await (async () => {
    let str = (
        await readFile(new URL("./views/wait.html", import.meta.url))
    ).toString();
    let parse = "";
    for (let i = 0; i < str.length; i++)
        if (!(str[i] == "\n" || str[i] == "\r")) parse += str[i];
    return parse;
})();

let start_html = await (async () => {
    let str = (
        await readFile(new URL("./views/start.html", import.meta.url))
    ).toString();
    let parse = "";
    for (let i = 0; i < str.length; i++)
        if (!(str[i] == "\n" || str[i] == "\r")) parse += str[i];
    return parse;
})();

let prompt_html = await (async () => {
    let str = (
        await readFile(new URL("./views/prompt.html", import.meta.url))
    ).toString();
    let parse = "";
    for (let i = 0; i < str.length; i++)
        if (!(str[i] == "\n" || str[i] == "\r")) parse += str[i];
    return parse;
})();

let session = {
    active: [
        {
            code: "123456",
            quiz: {
                name: "test",
                questions: [
                    {
                        correct: 1,
                        options: [
                            "Object-oriented",
                            "Object-based",
                            "Assembly-language",
                            "High-level",
                        ],
                        text: "Javascript is an _______ language.",
                    },
                    {
                        correct: 0,
                        options: ["in", "is in", "exists", "lies"],
                        text: "What keyword is used to check whether a given property is valid or not?",
                    },
                ],
            },
            status: "queued",
            players: [],
        },
    ],
};

app.get("/", (req, res) => {
    res.render("index", { ...defaults });
});

app.get("/room", (req, res) => {
    let name = req.query.name;
    let code = req.query.code;
    let check = session.active.filter((x) => x.code == code);
    if (check.length == 0) {
        res.redirect("/error", { error: "Invalid code" });
    } else {
        let check2 = check[0].players.filter((x) => x.name == name);
        if (check2.length == 0) {
            check[0].players.push(name);
            res.render("room", { name: name, code: code, ...defaults });
        } else {
            res.redirect("/error", { error: "Name already taken" });
        }
    }
});

app.get("/quiz", (req, res) => {
    let name = req.query.name;
    let code = req.query.code;

    let check = session.active.filter((x) => x.code == code);
    if (check.length == 0) {
        // todo: redirect to error page
        res.end();
    } else {
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders(); // flush the headers to establish SSE with client

        let length = check[0].quiz.questions.length * 5000 - 200;
        let interval_id = setInterval(() => {
            let check2 = check[0].status;
            if (check2 == "queued") {
                let wait = Sqrl.render(wait_html, { name: name });
                res.write(`event: queued\ndata: ${wait}\n\n`);
            } else {
                let time = check2 - Date.now();
                if (time > 500) {
                    let wait = Sqrl.render(start_html, {
                        time: Math.ceil(time / 1000),
                    });
                    res.write(`event: start\ndata: ${wait}\n\n`);
                } else if (time > 0) {
                    let prompt = Sqrl.render(prompt_html, {
                        ...check[0].quiz.questions[0],
                    });
                    res.write(`event: question\ndata: ${prompt}\n\n`);
                } else if (time <= -length) {
                    clearInterval(interval_id);
                    res.end();
                    return;
                } else {
                    let ques =
                        check[0].quiz.questions[
                            Math.floor(Math.abs(time) / 5000)
                        ];
                    let prompt = Sqrl.render(prompt_html, {
                        ques: Math.floor(Math.abs(time) / 5000),
                        selected: false,
                        ...ques,
                    });
                    res.write(`event: question\ndata: ${prompt}\n\n`);
                }
            }
        }, 1000);

        req.on("close", () => {
            clearInterval(interval_id);
            res.end();
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login", { ...defaults });
});

app.get("/signup", (req, res) => {
    res.render("signup", { ...defaults });
});

app.get("/data", (req, res) => {
    res.send(session);
});

app.get("/start", (req, res) => {
    let code = req.query.code;
    let check = session.active.filter((x) => x.code == code);
    if (check.length == 0) {
        // todo: redirect to error page
        res.end();
    } else {
        let start_time = Date.now() + 5000;
        check[0].status = start_time;
        res.send(`Starting quiz at ${start_time}ms`);
    }
});

app.get("/stop", (req, res) => {
    let code = req.query.code;
    let check = session.active.filter((x) => x.code == code);
    if (check.length == 0) {
        // todo: redirect to error page
        res.end();
    } else {
        check[0].status = "queued";
        check[0].players = [];
        res.send(`Stopping quiz`);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
