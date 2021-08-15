//ENV environment constiable file
require("dotenv").config();

const hbs = require("hbs");
const express = require("express");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
//Port
const PORT = process.env.PORT;
//Bcrypt password
const bcrypt = require("bcryptjs");
//cookie-parser
const cookieParser = require("cookie-parser");
//Database Connection
require("./db/conn");
//Multer fileupload
const multer = require("multer");
var upload = multer({ dest: "uploads/" });

hbs.registerHelper("dateFormat", require("handlebars-dateformat"));
//Cloudinary connection
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: "823225572349428",
  // api_key: "726957624429913",
  api_secret: process.env.API_SECRET,
  secure: true,
});
//Template Path
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");

//UserSchema
const User = require("./models/userSchema");
const Admin = require("./models/adminSchema");
const Contact = require("./models/contactSchema");
const Authenticate = require("./middleware/authenticate");
const adminAuthenticate = require("./middleware/adminAuthenticate");
const Blog = require("./models/blogSchema");

app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
// app.use(fileUpload());
app.use(express.urlencoded({ extend: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
require("./db/conn");
app.use(require("./routers/user2"));
//Home Route
//---------------------------
app.get("/", async (req, res) => {
  try {
    const userBlog = await Blog.find().sort({ createdAt: "desc" });
    if (!userBlog) {
      throw new Error("User not found");
    }
    console.log(userBlog);
    const userBlogs = userBlog.slice(0, 4);
    res.render("index", { blog: userBlogs });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});
//Blogs Route
//----------------
app.get("/blogs", async (req, res) => {
  try {
    const userBlog = await Blog.find();
    if (!userBlog) {
      throw new Error("User not found");
    }
    res.render("blogs", { blog: userBlog });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});
//FindBlogs Route
//----------------
app.post("/blogs", async (req, res) => {
  const blogname = req.body.blogname;
  console.log(blogname);
  try {
    let rootBlog = null;

    if (blogname == "") {
      rootBlog = await Blog.find();
    } else {
      rootBlog = await Blog.find({ blogname: blogname });
    }

    if (!rootBlog) {
      throw new Error("Blog not found");
    }
    req.rootBlog = rootBlog;
    res.render("blogs", { blog: req.rootBlog });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
});

//SignInUp Route
//---------------------------
app.get("/signInUp", (req, res) => {
  res.render("signInUp");
});
//SignInUp Route
//---------------------------
app.get("/signInUpUser", (req, res) => {
  res.render("signInUpUser");
});
//Blog Route
//---------------------------
app.get("/blog", Authenticate, (req, res) => {
  console.log(req.rootUser);
  res.render("Createblog", { profile: req.rootUser });
});
app.get("/Contactus", Authenticate, (req, res) => {
  res.render("contactus", { profile: req.rootUser });
});

app.get("/aboutus", (req, res) => {
  res.render("aboutus");
});
app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});

app.get("/adminLogin", (req, res) => {
  res.render("adminLogin");
});
app.get("/adminpage", adminAuthenticate, (req, res) => {
  res.render("adminpage");
});

app.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Fill both the fields" });
    }
    const adminLogin = await Admin.findOne({ email: email, password: password });
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

//Blogger Profile Route
//---------------------------
app.get("/blogger", Authenticate, async (req, res) => {
  try {
    const email = req.rootUser.email;
    const userBlog = await Blog.find({ email: email });
    if (!userBlog) {
      throw new Error("User not found");
    }
    req.userBlog = userBlog;
    res.render("blogger", { blog: req.userBlog, profile: req.rootUser });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
  // res.render("profile", { "blog": req.rootUser.blogs, "profile": req.rootUser })
});

//Blogger Myblogs Route
//---------------------------
app.get("/myblogs", Authenticate, async (req, res) => {
  try {
    const email = req.rootUser.email;
    const userBlog = await Blog.find({ email: email }).sort({
      createdAt: "desc",
    });
    if (!userBlog) {
      throw new Error("User not found");
    }
    res.render("myblogs", { blog: userBlog, profile: req.rootUser });
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
  // res.render("profile", { "blog": req.rootUser.blogs, "profile": req.rootUser })
});

//SignUp Route
app.post("/signup", async (req, res) => {
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
      res.redirect("/signInUp");
    }
  } catch (err) {
    console.log(err);
  }
});
//contactus Route
app.post("/contactus", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.redirect("/contactus");
  }
  catch (err) {
    console.log(err);
  }
});
//Comment route
app.post("/comment/:blogID", async (req, res) => {
  try {
    let blogID = req.params.blogID;
    // const commentedBy = req.rootUser.email;
    const { comment } = req.body;
    const userComment = await Blog.findOne({ _id: blogID });

    if (userComment) {
      const userComments = await userComment.addComment(
        // commentedBy,
        comment
      );
      await userComment.save();
      res.redirect("/blog/" + blogID);
    }
  } catch (error) {
    console.log(error);
  }
});

//SignIn Route
//-----------------------
app.post("/signin", async (req, res) => {
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

        // return res.status(201).render("blogger", { profile: req.rootUser });
        return res.redirect("/blogger");
      }
    } else {
      return res.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (err) {
    console.log(err);
  }
});
//Create Blog
//--------------------------------
app.post("/createBlog", Authenticate, upload.single("photo"), (req, res) => {
  const pic = req.file;
  cloudinary.uploader.upload(pic.path, async (err, result) => {
    const { name, email } = req.rootUser;
    const { blogname, blogcontent, blogdesc, tags } = req.body;
    const blogimage = result.secure_url;
    try {
      const regBlog = new Blog({
        name,
        email,
        blogname,
        blogdesc,
        blogcontent,
        blogimage,
        tags,
      });
      await regBlog.save();
      res.redirect("myblogs");
    } catch (err) {
      console.log(err);
    }
    const userBlog = await User.findOne({ _id: req.userID });
  });
});

//To get blog by ID
app.get("/myblog/:blogID", Authenticate, async (req, res) => {
  let blogID = req.params.blogID;
  const fullBlog = await Blog.find({ _id: blogID });
  console.log(fullBlog);
  res.status(201).render("edit", { fullBlog: fullBlog });
});

app.get("/blog/:blogID", async (req, res) => {
  let blogID = req.params.blogID;
  const fullBlog = await Blog.findOne({ _id: blogID });
  console.log(fullBlog);
  console.log(fullBlog.comments);
  res
    .status(201)
    .render("blog", { fullBlog: fullBlog, comm: fullBlog.comments });
});

app.get;
//Edit Blog
app.put("/editBlog/:id", Authenticate, async (req, res) => {
  try {
    const _id = req.params.id;
    const blog = await Blog.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    res.redirect("/myblogs");
    console.log(blog);
  } catch (err) {
    res.status(500).send(err);
  }
});
//Delete Blog
app.delete("/deleteBlog/:id", Authenticate, async (req, res) => {
  try {
    const _id = req.params.id;
    const blog = await Blog.findByIdAndDelete(_id);
    res.redirect("/myblogs");
    console.log(blog);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Logout User
//----------------
app.get("/logout", (req, res) => {
  console.log("Hello from Logout");
  res.clearCookie("jwtoken");
  // res.status(200).send("Logout User");
  res.redirect("/");
});

//Port Listener
//----------------------------
app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
