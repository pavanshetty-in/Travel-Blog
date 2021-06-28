require("dotenv").config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT;
require("./db/conn");
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");
const User = require("./models/userSchema");
app.use(express.json());
app.use(express.urlencoded({ extend: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs")
app.set("views", template_path)
app.get('/', (req, res) => {
    res.render("index")
})
app.get('/signInUp', (req, res) => {
    res.render("signInUp")
})
app.post('/signin', async (req, res) => {
    try {
        const regUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        const signedin = await regUser.save()
        res.status(201).render("index")

    } catch (error) {
        res.status(400).send(error)

    }
})
app.listen(PORT, () => {
    console.log(`Server is running at port no ${PORT}`);
})