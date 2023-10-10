import express from "express";
import * as Sqrl from "squirrelly";

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
