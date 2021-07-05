//ENV environment variable file
require("dotenv").config();

const express = require('express');
const path = require('path');
const app = express();
//Port 
const PORT = process.env.PORT;

//Bcrypt password
const bcrypt = require("bcryptjs");

//Database Connection
require("./db/conn");

//Template Path
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");

//UserSchema
const User = require("./models/userSchema");

app.use(express.json());
app.use(express.urlencoded({ extend: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs")
app.set("views", template_path)

//Home Route
//---------------------------
app.get('/', (req, res) => {
    res.render("index")
})

//SignInUp Route
//---------------------------
app.get('/signInUp', (req, res) => {
    res.render("signInUp")
})

//SignUp Route
app.post('/signup', async (req, res) => {
    const { name, email, password, cpassword } = req.body;

    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ Error: "User already Exists" });
        } else if (password != cpassword) {
            return res.status(422).json({ Error: "Passwords are not matching " });
        } else {
            const regUser = new User({ name, email, password });
            await regUser.save();
            res.status(201).json({ message: "User registered successfully" });
        }
    } catch (err) {
        console.log(err);
    }
})

//SignIn Route
//-----------------------
app.post('/signin', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const userLogin = await User.findOne({ email })

        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            if (!isMatch) {
                res.status(400).send("Invalid Credentials!")
            }
            else {
                res.status(201).send("Login Successfull!")
            }
        }
        else {
            res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        res.status(400).send(error)
    }
})

//Port Listener
//----------------------------
app.listen(PORT, () => {
    console.log(`Server is running at port no ${PORT}`);
})