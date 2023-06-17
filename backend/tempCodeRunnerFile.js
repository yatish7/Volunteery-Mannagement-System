const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const { Collection1, Collection2, Collection3 } = require("./mongodb");

const app = express();
const viewPath = path.join(__dirname, "../views");
app.set("views", viewPath);

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

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
  await Collection1.insertMany(data);

  res.redirect("/");  
});

app.post("/login", async (req, res) => {
  try {
    const verify = await Collection1.findOne({ email: req.body.email });
    if (verify.password === req.body.password) {
      req.session.name = verify.name;
      req.session.category = verify.category;
      res.redirect("/index");
    } else {
      res.render("login", { errorMessage: "Wrong Password" });
    }
  } catch {
    res.render("login", { errorMessage: "Invalid Credentials" });
  }
});

app.post("/index", async (req, res) => {
  const postData = {
    title: req.body.title,
    description: req.body.description,
  };
  
  await Collection2.insertMany([postData]);
  console.log(postData);

  res.redirect("/index");
});

app.get("/profile", async (req, res) => {
  const category = req.session.category;
  const name = req.session.name;

  let profileView;
  if (category === "Volunteer") {
    profileView = "volunteer";
  } else if (category === "Admin") {
    profileView = "admin";
  } else if (category === "Co-ordinator") {
    profileView = "coordinator";
  } else {
    return res.send("Invalid category"); // Display a generic error message
  }

  try {
    const user = await Collection1.findOne({ name: name });

    if (user) {
      res.render(profileView, { userName: user.name, category, programs: user.programs});
    } else {
      return res.send("User not found");
    }
  } catch (error) {
    console.log(error);
    return res.send("Error retrieving user information");
  }
});

app.post("/submit-announcement", async (req, res) => {
  const { title, description } = req.body;

  try {
    const announcement = new Collection3({
      title,
      description,
    });

    await announcement.save();

    // Retrieve all announcements including the new one
    const announcements = await Collection3.find();

    res.redirect("/index"); // Redirect to the index route
  } catch (error) {
    console.log(error);
    res.send("Error submitting announcement");
  }
});
app.get("/index", async (req, res) => {
  try {
    const announcements = await Collection3.find();
    res.render("index", { announcements });
  } catch (error) {
    console.log(error);
    res.send("Error retrieving announcements");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
