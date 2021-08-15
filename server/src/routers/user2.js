const express = require("express");
const user2Router = express.Router();
const bcrypt = require("bcryptjs");
require("../db/conn");
const User2 = require("../models/user2Schema");
user2Router.use(express.json())

//SignUp Route
user2Router.post("/signupUser", async (req, res) => {
    const { name, email, password, cpassword } = req.body;
    try {
        const userExist = await User2.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ Error: "User already Exists" });
        } else if (password != cpassword) {
            return res.status(422).json({ Error: "Passwords are not matching " });
        } else {
            const regUser = new User2({ name, email, password });
            await regUser.save();
            res.redirect("/signInUpUser");
        }
    } catch (err) {
        console.log(err);
    }
});

//SignIn Route
//-----------------------
user2Router.post("/signinUser", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Fill both the fields" });
        }
        const userLogin = await User2.findOne({ email: email });
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
                return res.redirect("/blogs");
            }
        } else {
            return res.status(400).json({ error: "Invalid Credentials!" });
        }
    } catch (err) {
        console.log(err);
    }
});
module.exports = user2Router;