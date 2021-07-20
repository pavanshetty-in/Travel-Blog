const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
    blogs: [
        {
            blogname: {
                type: String,
                required: true,
            },
            blogcontent: {
                type: String,
                required: true,
            },
        }
    ]

});

//Bcrypt(hashing) password
//------------------------
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

//Token Generation
//----------------
userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
};
//Blog Storing function
//-------------------------
userSchema.methods.addBlog = async function (blogname,blogcontent) {
    try {
      this.blogs = this.blogs.concat({ blogname,blogcontent });
      await this.save();
      return this.blogs;
    } catch (error) {
      console.log(error);
    }
  };
  
const User = mongoose.model("USER", userSchema);

module.exports = User;
