const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://lonelydomino:Kiwi2023@cluster0.jycrvss.mongodb.net/todoapp?retryWrites=true&w=majority&appName=Cluster0";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://todos-mern-client.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB!"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Check your internet connection");
    console.error("2. Verify your IP address is whitelisted in MongoDB Atlas");
    console.error("3. Check if the MongoDB Atlas cluster is running");
    console.error("4. Verify your username and password are correct");
  });

const Todo = require("./models/Todo.js");

app.get("/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post("/todo/new", (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });

  todo.save();

  res.json(todo);
});

app.delete("/todo/delete/:id", async (req, res) => {
  console.log("IN DELETE");
  const result = await Todo.findByIdAndDelete(req.params.id);
  console.log(result);
  res.json(result);
});

app.get("/todo/complete/:id", async (req, res) => {
  console.log("in complete");
  const todo = await Todo.findById(req.params.id);
  todo.complete = !todo.complete;
  todo.save();
  res.json(todo);
});
// Serve static files from React app in production (optional - for combined deployment)
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  const fs = require("fs");
  const buildPath = path.join(__dirname, "../client/build");

  // Only serve static files if build folder exists (for combined deployment)
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }
}

app.listen(process.env.PORT || 3001, "0.0.0.0", () =>
  console.log(`Server started on port ${process.env.PORT || 3001}.`)
);
