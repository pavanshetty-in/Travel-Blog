const mongoose = require("mongoose");

const DB = "mongodb+srv://modimanju:123@cluster0.hzffq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose
.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
.then(() => {
  console.log("connection successful");
})
.catch((err) => console.log("connection unsuccessful"));