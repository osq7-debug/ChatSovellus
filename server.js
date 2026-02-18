const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = 3000;

const oikeaHash = process.env.PASSWORD_HASH;

const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } 
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


function suojattu(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect("/"); 
    }

    
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    next();
}


// Login-sivu
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Welcome-sivu
app.get("/welcome", suojattu, (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.sendFile(path.join(__dirname, "welcome.html"));
});


// Login-logiikka
app.post("/login", async (req, res) => {
    const syote = req.body.salasana;

    const ok = await bcrypt.compare(syote, oikeaHash);

    if (ok) {
        req.session.loggedIn = true;
        res.redirect("/welcome");
    } else {
        res.redirect("/?error=1");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Virhe uloskirjautuessa");

        res.clearCookie("connect.sid");
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.redirect("/");
    });
});

/// CHAT HUONE ///


const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

let messages = [];

io.on("connection", socket => {
    console.log("Uusi käyttäjä yhdistetty");

    // Lähetetään vanhat viestit uudelle käyttäjälle
    socket.emit("chat history", messages);

    // Kuunnellaan uusia viestejä
    socket.on("chat message", msg => {
        messages.push(msg); 
        io.emit("chat message", msg); 
    });


});


http.listen(PORT, () => {
    console.log(`Palvelin käynnissä http://localhost:${PORT}`);
});