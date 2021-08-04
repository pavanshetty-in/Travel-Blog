//ENV environment constiable file
require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
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

var upload = multer({ dest: 'uploads/' });

//Cloudinary connection
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: "726957624429913",
  api_secret: process.env.API_SECRET,
  secure: true
});
//Template Path
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");

//UserSchema
const User = require("./models/userSchema");
const Authenticate = require("./middleware/authenticate");
const Blog = require("./models/blogSchema");

app.use(express.json());
app.use(cookieParser());
// app.use(fileUpload());
app.use(express.urlencoded({ extend: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);

//Home Route
//---------------------------
app.get("/", async (req, res) => {
  try {
    const userBlog = await Blog.find();
    if (!userBlog) {
      throw new Error("User not found");
    }
    const userBlogs = userBlog.slice(0, 3);
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
//Blog Route
//---------------------------
app.get("/blog", Authenticate, (req, res) => {
  console.log(req.rootUser);
  res.render("Createblog", { profile: req.rootUser });
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
    const userBlog = await Blog.find({ email: email });
    if (!userBlog) {
      throw new Error("User not found");
    }
    req.userBlog = userBlog;
    res.render("myblogs", { blog: req.userBlog, profile: req.rootUser });
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
      res.status(201).render("signInUp");
    }
  } catch (err) {
    console.log(err);
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
    const { blogname, blogcontent } = req.body;
    const blogimage = result.secure_url;
    try {
      const regBlog = new Blog({ name, email, blogname, blogcontent, blogimage });
      await regBlog.save();
      res.redirect("myblogs");
    } catch (err) {
      console.log(err);
    }
    const userBlog = await User.findOne({ _id: req.userID });
  })
});
//Logout User
//----------------
app.get("/logout", (req, res) => {
  console.log("Hello from Logout");
  res.clearCookie("jwtoken");
  // res.status(200).send("Logout User");
  res.status(201).render("index");
});

//Port Listener
//----------------------------
app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
