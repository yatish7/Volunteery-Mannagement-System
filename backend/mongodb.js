const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/loginDB")
  .then(() => {
    console.log("Connected successfully to database");
  })
  .catch(() => {
    console.log("Failed to connect to database");
  });

const signUpSchema = new mongoose.Schema({
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
  dob: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  programs: [{
    type: String,
  }],
});

const Collection1 = mongoose.model("Collection1", signUpSchema);

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Collection2 = mongoose.model("Collection2", formSchema);

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Collection3 = mongoose.model("Collection3", announcementSchema);

const activityUpdateSchema = new mongoose.Schema({
  program: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Collection4 = mongoose.model("Collection4", activityUpdateSchema);

module.exports = { Collection1, Collection2, Collection3, Collection4 };
