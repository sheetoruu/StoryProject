//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.connect("mongodb://0.0.0.0:27017/userDB")

.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Failed to connect to MongoDB', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the database!');
});


const userSchema = new mongoose.Schema( {
    email: String,
    password: String
});

const secret = "Thisisoursecret."
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema)

app.get("/", function (req, res) {
    res.render("home");
})

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async function(req, res) {
  const newUser = new User({
    email: req.body.username, 
    password: req.body.password
  });

  try {
    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.log(err);
  }
});


app.post("/login", async (req, res) => {
    try {
      const foundUser = await User.findOne({ email: req.body.username });
      if (foundUser && foundUser.password === req.body.password) {
        res.render("secrets");
      } else {
        res.send("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      res.send("An error occurred");
    }
  });
  

app.listen(3000, function () {
    console.log("server started on port 3000")
})