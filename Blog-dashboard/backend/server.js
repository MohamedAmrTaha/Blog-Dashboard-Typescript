const express = require("express");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;
const SECRET_KEY = "your_secret_key"; // Use environment variables in production
const DATA_FILE = "./data.json";

app.use(cors());
app.use(express.json());

// Load & Save Data Helpers
const loadData = () =>
  !fs.existsSync(DATA_FILE)
    ? { users: [], posts: [] }
    : JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const saveData = (data) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Middleware to Verify Token (Protect All Routes Except Signup/Login)
const verifyToken = (req, res, next) => {
  if (["/signup", "/login"].includes(req.path)) return next(); // Allow signup & login

  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

app.use(verifyToken); // Protect all routes except signup & login



// User Authentication Routes
app.post("/signup", (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = loadData();

    if (data.users.some((user) => user.email === email))
      return res.status(400).json({ error: "User already exists" });

    const newUser = { id: Date.now(), name, email, password };
    data.users.push(newUser);
    saveData(data);

    res.json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
 
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const data = loadData();

  const user = data.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email, name:user.name }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token, user });
});

// Dashboard Route (Protected)
app.get("/dashboard", (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!`, user: req.user });
});

// Blog Post Routes (Protected)
app.get("/posts", (req, res) => res.json(loadData().posts));

app.post("/new-post", (req, res) => {
  const { title, body } = req.body;
  const data = loadData();
  console.log(req.user);

  const newPost = { id: Date.now(), title, body, author: req.user.name, publishedAt: new Date(), authorId: req.user.id };
  data.posts.push(newPost);
  saveData(data);

  res.json({ message: "Post added!", post: newPost });
});

app.delete("/delete-post/:id", (req, res) => {
  const data = loadData();
  data.posts = data.posts.filter((post) => post.id !== parseInt(req.params.id));
  saveData(data);

  res.json({ message: "Post deleted!" });
});

app.get("/posts/:id", (req, res) => {
  const data = loadData();
  const post = data.posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  res.json(post);
});

app.get("/user-posts", (req, res) => {
  const data = loadData();
  const userPosts = data.posts.filter(
    (post) => post.authorId === req.user.id
  );
  res.json(userPosts);
});


// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
