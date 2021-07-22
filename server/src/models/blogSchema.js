const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    blogname: {
        type: String,
        required: true,
    },
    blogcontent: {
        type: String,
        required: true,
    },
});

const Blog = mongoose.model("BLOG", blogSchema);

module.exports = Blog;
