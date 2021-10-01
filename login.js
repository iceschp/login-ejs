var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodelogin"
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/login", function(request, response) {
    response.sendFile(path.join(__dirname + "/login.html"));
});

app.post("/auth", function(request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if (username && password) {
        connection.query(
        "SELECT * FROM accounts WHERE username = ? AND password = ?",
        [username, password],
        function(error, results, fields) {
            // console.log(username);
            if (results.length > 0) {
            request.session.loggedin = true;
            request.session.username = username;
            // response.redirect("/home");
            response.redirect("/webboard");
            } else {
            response.send("Incorrect Username and/or Password!");
            }
            response.end();
        }
    );
    } else {
        response.send("Please enter Username and Password!");
        response.end();
    }
});

app.get("/home", function(request, response) {
    if (request.session.loggedin) {
        response.send("Welcome back, " + request.session.username + "!");
      //response.redirect("/webboard");
    } else {
        response.send("Please login to view this page!");
    }
    response.end();
});

app.get("/signout", function(request, response) {
    request.session.destroy(function (err) {
            response.send("Signout ready!");
            response.end();
    });
});

app.get("/webboard", (req, res) => {
    if (req.session.loggedin)
        connection.query("SELECT * FROM accounts", (err, result) => {
        res.render("index.ejs", {
            posts: result
        });
        console.log(result);
        });
    else
        res.send("You must to login First!!!");
        console.log("You must to login First!!!");
        // res.end();
});

// running port
app.listen(9000);
console.log("running on port 9000...");