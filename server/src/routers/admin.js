const express = require("express");
const adminRouter = express.Router();
require("../db/conn");
const Admin = require("../models/adminSchema");
const Contact = require("../models/contactSchema");
const User = require("../models/userSchema");
const User2 = require("../models/user2Schema");
const Blog = require("../models/blogSchema");
adminRouter.use(express.json());
const adminAuthenticate = require("../middleware/adminAuthenticate");

adminRouter.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

adminRouter.get("/adminpage", adminAuthenticate, async (req, res) => {
  try {
    const messages = await Contact.find();
    if (!messages) {
      throw new Error("Messages not found");
    }
    const bloggers = await User.find();
    if (!bloggers) {
      throw new Error("Bloggers not found");
    }
    const users = await User2.find();
    if (!users) {
      throw new Error("Users not found");
    }
    const blogs = await Blog.find();
    if (!blogs) {
      throw new Error("Blogs not found");
    }
    const messagesCount = messages.length;
    const bloggersCount = bloggers.length;
    const usersCount = users.length;
    const blogsCount = blogs.length;
    console.log(messagesCount);
    console.log(bloggersCount);
    console.log(usersCount);
    console.log(blogsCount);
    res.render("adminpage", {
      messages: messages,
      bloggers: bloggers,
      users: users,
      blogsCount: blogsCount,
    });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/messages", adminAuthenticate, async (req, res) => {
  try {
    const messages = await Contact.find();
    if (!messages) {
      throw new Error("User not found");
    }
    console.log(messages);
    res.render("admin-messages", { messages: messages });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/bloggers", adminAuthenticate, async (req, res) => {
  try {
    const bloggers = await User.find();
    if (!bloggers) {
      throw new Error("User not found");
    }
    console.log(bloggers);
    res.render("admin-bloggers", { bloggers: bloggers });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/users", adminAuthenticate, async (req, res) => {
  try {
    const users = await User2.find();
    if (!users) {
      throw new Error("User not found");
    }
    console.log(users);
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/blogs", adminAuthenticate, async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs) {
      throw new Error("User not found");
    }
    console.log(blogs);
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Fill both the fields" });
    }
    const adminLogin = await Admin.findOne({
      email: email,
      password: password,
    });
    if (adminLogin) {
      const token = await adminLogin.generateAuthToken();
      console.log("token:", token);
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now + 25892000000),
        httpOnly: true,
      });
      return res.redirect("/adminpage");
    } else {
      return res.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = adminRouter;
