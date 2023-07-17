const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const { Collection1, Collection2, Collection3, Collection4,Collection5,Collection6 } = require("./mongodb");
const app = express();
const viewPath = path.join(__dirname, "../views");
app.set("views", viewPath);

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

const Handlebars = require("hbs");
const handlebarsHelpers = require("handlebars-helpers")();
Handlebars.registerHelper(handlebarsHelpers);

// Assuming you have a list of verification posts and verified posts stored in variables
var verificationPosts = [];
var verifiedPosts = [];
var posts = [];

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});


app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    dob: req.body.dob,
    address: req.body.address,
    phone_number: req.body.phone_number,
    category: req.body.category,
    programs: req.body.programs || [],
  };

  try {
    const result = await Collection1.insertMany([data]);
    const volunteerId = result[0]._id; 
    req.session.volunteerId = volunteerId;
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("Error signing up");
  }
});

app.post("/login", async (req, res) => {
  try {
    const verify = await Collection1.findOne({ email: req.body.email });
    if (verify && verify.password === req.body.password) {
      req.session.userId = verify._id;
      req.session.name = verify.name;
      req.session.category = verify.category;
      res.redirect("/index");
    } else {
      res.render("login", { errorMessage: "Wrong Password" });
    }
  } catch (error) {
    console.log(error);
    res.render("login", { errorMessage: "Invalid Credentials" });
  }
});

app.post('/verify/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post in Collection2
    const post = await Collection2.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    // Create a new document in Collection5 using the data from the post in Collection2
    const verifiedPost = new Collection5({
      title: post.title,
      description: post.description,
      volunteer: post.volunteer,
      volunteerName: post.volunteerName,
      verified: true, // Set the verified flag to true
    });

    // Save the verified post in Collection5
    await verifiedPost.save();

    // Remove the post from Collection2
    await Collection2.findByIdAndRemove(postId);

    // Redirect to the index page
    res.redirect('/index');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred during verification');
  }
});



app.post('/unverify/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Remove the unverified post from Collection2
    await Collection2.findByIdAndRemove(postId);

    // Redirect to the index page
    res.redirect('/index');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred during unverification');
  }
});


app.post("/index", async (req, res) => {
  try {
    const volunteerId = req.session.userId; // Assuming you have a userId stored in the session
    const volunteerName = req.session.name; // Assuming you have a name stored in the session

    if (!volunteerId || !volunteerName) {
      throw new Error("Volunteer information is missing");
    }

    const postData = {
      title: req.body.title,
      description: req.body.description,
      volunteer: volunteerId,
      volunteerName: volunteerName,
    };

    await Collection2.create(postData);

    res.redirect("/index");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error submitting post");
  }
});
app.post("/submit-announcement", async (req, res) => {
  try {
    const announcementData = {
      title: req.body.title,
      description: req.body.description,
    };

    await Collection3.create(announcementData);

    res.redirect("/index");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error submitting announcement");
  }
});

app.get('/profile', async (req, res) => {
  const category = req.session.category;
  const name = req.session.name;

  let profileView;
  if (category === 'Volunteer') {
    profileView = 'volunteer';
  } else if (category === 'Admin') {
    profileView = 'admin';
  } else if (category === 'Co-ordinator') {
    profileView = 'coordinator';
  } else {
    return res.send('Invalid category');
  }

  try {
    const user = await Collection1.findOne({ name: name });

    if (user) {
      const programs = user.programs;
      const { phone_number, dob, address } = user;

      const verificationPosts = []; // Retrieve verification posts
      const verifiedPosts = await Collection2.find({ verified: true })
        .sort({ _id: -1 })
        .populate('volunteer', 'name');
      const posts = await Collection2.find()
        .sort({ _id: -1 })
        .populate('volunteer', 'name');

      const announcements = await Collection3.find().sort({ _id: -1 });
      const activities = await Collection4.find().sort({ _id: -1 });

      res.render(profileView, {
        user: user,
        userName: user.name,
        category,
        programs,
        verificationPosts,
        verifiedPosts,
        posts,
        announcements,
        name: user.name,
        dob,
        address,
        phone_number,
      });
    } else {
      return res.send('User not found');
    }
  } catch (error) {
    console.log(error);
    return res.send('Error retrieving user information');
  }
});
app.get('/index', async (req, res) => {
  try {
    const verifiedPosts = await Collection5.find({ verified: true })
    .sort({ _id: -1 })
    .populate('volunteer', 'name');

  const announcements = await Collection3.find().sort({ _id: -1 });

    // Fetch the count of documents from Collection1 where the category is "Volunteer"
    const volunteerCount = await Collection1.countDocuments({ category: 'Volunteer' });
    const coordinatorCount = await Collection1.countDocuments({ category: 'Co-ordinator' });
    const adminCount = await Collection1.countDocuments({ category: 'Admin' });

    // Rest of the code...
    res.render('index', { verifiedPosts, announcements, volunteerCount, coordinatorCount, adminCount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving data');
  }
});



app.post("/activity-update", async (req, res) => {
  const volunteerId = req.session.userId; // Assuming you have a userId stored in the session
  const volunteerName = req.session.name;
  if (!volunteerId || !volunteerName) {
    throw new Error("Volunteer information is missing");
  }
  try {
    const activityUpdateData = {
      program: req.body.program,
      startDate: req.body["start-date"],
      endDate: req.body["end-date"],
      hours: req.body.hours,
      description: req.body.description,
      volunteer: volunteerId,
      volunteerName: volunteerName,
    };

    await Collection4.create(activityUpdateData);

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error submitting activity update");
  }
});

app.use(express.static(path.join(__dirname, "../public")));

app.listen(3000, () => {
  console.log("Server is up on port 3000");
});