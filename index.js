import express from "express";
import * as Sqrl from "squirrelly";

import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readFile } from "fs/promises";
const serviceAccount = JSON.parse(
  await readFile(new URL("./admin.json", import.meta.url))
);
initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    "https://ossp-53235-default-rtdb.asia-southeast1.firebasedatabase.app",
});
var db = getDatabase();

let data_promise = await db.ref().child("quiz").once("value");
let data = data_promise.val();
console.log(data);

const create = (/* ques */) => {
  let counter = data_promise.child("counter").val();
  console.log("counter: ", counter);

  // Format of the question for input in the function
  // let ques = {
  //   0: {
  //     "correct": 0,
  //     "option": {
  //       0: "good",
  //       1: "fine",
  //       2: "bad",
  //     },
  //     "text": "how are you?",
  //   },
  // };

  db.ref().child("quiz").set(counter)
  db.ref(`quiz/${counter}`).set(ques)
  .then(function () {
    console.log("Synchronization succeeded");
  })
  .catch(function (error) {
    console.log("Synchronization failed");
  });
  
  db.ref("quiz").child("counter").set(counter+1);
};
// create();

let id = 0;
const get = (id) => {
  // It returns array of questions with its text, options and correct answer
  return data_promise.child(id).val()
}
console.log(get(id));

const app = express();
const port = 8080;

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

app.get("/", (req, res) => {
  res.render("index", { ...defaults });
});

app.get("/room", (req, res) => {
  res.render("room", {
    name: req.query.name,
    code: req.query.code,
    ...defaults,
  });
});

app.get("/wait", (req, res) => {
  res.render("wait", { name: req.query.name, code: req.query.code });
});

app.get("/login", (req, res) => {
  res.render("login", { ...defaults });
});

app.get("/signup", (req, res) => {
  res.render("signup", { ...defaults });
});

app.get("/quiz/:id", (req, res) => {
  console.log(req.params.id);
  res.render("quiz", { code: req.params.id });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
