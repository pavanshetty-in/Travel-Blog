//ENV environment variable file
require("dotenv").config();

const express = require('express');
const path = require('path');
const app = express();
//Port 
const PORT = process.env.PORT;

//Bcrypt password
const bcrypt = require("bcryptjs");
//cookie-parser 
const cookieParser = require("cookie-parser");
//Database Connection
require("./db/conn");

//Template Path
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");

//UserSchema
const User = require("./models/userSchema");
const Authenticate = require("./middleware/authenticate");

app.use(express.json());
app.use(cookieParser());
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
//Blog Route
//---------------------------
app.get('/blog', Authenticate, (req, res) => {
    console.log(req.rootUser);
    res.render("blog")
})
//Profile Route
//---------------------------
app.get('/profile', Authenticate, (req, res) => {
    console.log(req.rootUser);
    res.render("profile",{"blog":req.rootUser.blogs,"profile":req.rootUser})
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
            res.status(201).render('signInUp');
        }
    } catch (err) {
        console.log(err);
    }
})

//SignIn Route
//-----------------------
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Fill both the fields" });
        }
        const userLogin = await User.findOne({ email: email });
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            if (!isMatch) {
                return res.status(400).json({ error: "Invalid Credentials!" });
            } else {
                const token = await userLogin.generateAuthToken();
                console.log("token:", token);
                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now + 25892000000),
                    httpOnly: true,
                });
                return res.status(201).render('index');

            }
        } else {
            return res.status(400).json({ error: "Invalid Credentials!" });
        }
    } catch (err) {
        console.log(err);
    }
})
//Create Blog 
//--------------------------------
app.post('/createBlog', Authenticate, async (req, res) => {
    try {
        const { blogname,blogcontent } = req.body;
        if (!blogname || !blogcontent ) {
            console.log("Plz fill the blog form");
            return res.status(422).json({ error: "plz fill the blog form" });
        }
        const userBlog = await User.findOne({ _id: req.userID });

        if (userBlog) {
            const userMessage = await userBlog.addBlog(
                blogname,
                blogcontent
            );
            await userBlog.save();
            res.status(201).json({ message: "User blog data sent successfully" });
        }
    } catch (error) {
        console.log(error);
    }

}
)
//Logout User
//----------------
app.get("/logout", (req, res) => {
    console.log("Hello from Logout");
    res.clearCookie("jwtoken");
    // res.status(200).send("Logout User");
    res.status(201).render('index')
});

//Port Listener
//----------------------------
app.listen(PORT, () => {
    console.log(`Server is running at port no ${PORT}`);
})