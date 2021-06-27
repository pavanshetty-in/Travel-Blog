const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
require("./db/conn");
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.set("view engine", "hbs")
app.set("views", template_path)
app.get('/', (req, res) => {
    res.render("index")
})
app.get('/signInUp', (req, res) => {
    res.render("signInUp")
})
app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
})