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
    blogimage: {
        type: String,
        required: true,
    },
    blogdesc: {
        type: String,
        required: true,
    },
    blogcontent: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: String,
        required: true,
    },
    comments: [
        {
            commentedBy: {
                type: String
            },
            comment: {
                type: String
            },
        }
    ]

});
//Blog comment function
//-------------------------
blogSchema.methods.addComment = async function ( comment) {
    try {
        this.comments = this.comments.concat({ comment });
        await this.save();
        return this.comments;
    } catch (error) {
        console.log(error);
    }
};
const Blog = mongoose.model("BLOG", blogSchema);

module.exports = Blog;
