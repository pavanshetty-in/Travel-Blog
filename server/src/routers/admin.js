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
    res.render("admin-users", { users: users });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/blogs", adminAuthenticate, async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' });
    if (!blogs) {
      throw new Error("Blogs not found");
    }
    const blogsApproved = await Blog.find({ status: 'approve' });
    if (!blogsApproved) {
      throw new Error("Blogs not found");
    }
    console.log(blogs);
    console.log(blogsApproved);
    res.render("admin-blogs", {  blogsApproved: blogsApproved });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

adminRouter.get("/admin/ablogs", adminAuthenticate, async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' });
    if (!blogs) {
      throw new Error("Blogs not found");
    }
    const blogsApproved = await Blog.find({ status: 'approve' });
    if (!blogsApproved) {
      throw new Error("Blogs not found");
    }
    console.log(blogs);
    console.log(blogsApproved);
    res.render("admin-ablogs", { blogs: blogs});
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});


adminRouter.get("/admin", (req, res) => {
  return res.redirect("/adminpage");
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

adminRouter.delete(
  "/admindeleteBlog/:id",
  adminAuthenticate,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const blog = await Blog.findByIdAndDelete(_id);
      res.redirect("/admin/blogs");
      console.log(blog);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

adminRouter.get("/adminblog/:blogID", adminAuthenticate, async (req, res) => {
  let blogID = req.params.blogID;
  const fullBlog = await Blog.findOne({ _id: blogID });
  console.log(fullBlog);
  console.log(fullBlog.comments);
  res
    .status(201)
    .render("blog", { fullBlog: fullBlog, comm: fullBlog.comments });
});

adminRouter.put("/editStatus/:id", adminAuthenticate, async (req, res) => {
  try {
    const _id = req.params.id;
    const status = await Blog.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    console.log(status);
    res.render("admin-blogs");
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = adminRouter;
