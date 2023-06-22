const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const { Collection1, Collection2, Collection3, Collection4 } = require("./mongodb");

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
  await Collection1.insertMany([data]);

  res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    const verify = await Collection1.findOne({ email: req.body.email });
    if (verify && verify.password === req.body.password) {
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

app.post("/index", async (req, res) => {
  const postData = {
    title: req.body.title,
    description: req.body.description,
    volunteer: req.session.name, // Add the name of the volunteer as the "volunteer" field
  };
  console.log(volunteer)

  try {
    await Collection2.insertMany([postData]);
    res.redirect("/index");
  } catch (error) {
    console.log(error);
    res.send("Error submitting announcement");
  }
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
    return res.send("Invalid category");
  }

  try {
    const user = await Collection1.findOne({ name: name });

    if (user) {
      const posts = await Collection2.find().sort({ _id: -1 });
      const programs = user.programs;
      const { phone_number, dob, address } = user;
      res.render(profileView, {
        user: user,
        userName: user.name,
        category,
        programs,
        posts,
        name: user.name,
        dob,
        address,
        phone_number,
      });
    } else {
      return res.send("User not found");
    }
  } catch (error) {
    console.log(error);
    return res.send("Error retrieving user information");
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

app.post("/submit-activity", async (req, res) => {
  const { program, startDate, endDate, hours, description } = req.body;

  try {
    const activityUpdate = new Collection4({
      program,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      hours: Number(hours),
      description,
    });

    await activityUpdate.save();

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.send("Error submitting activity update");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
