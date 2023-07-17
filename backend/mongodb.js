const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://YATISH:yatish180104@vmsdb.ds1cgci.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected successfully to database");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
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

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection1",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});
const Collection2=mongoose.model("Collection2",postSchema)


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
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection1",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
});

const Collection4 = mongoose.model("Collection4", activityUpdateSchema);

const verifiedPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection1",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});
const Collection5=mongoose.model("Collection5",verifiedPostSchema)

const activityVerifiedSchema = new mongoose.Schema({
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
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection1",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
});

const Collection6 = mongoose.model("Collection6", activityVerifiedSchema);

module.exports = { Collection1, Collection2, Collection3, Collection4,Collection5,Collection6 };