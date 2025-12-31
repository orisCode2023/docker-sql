import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;

import todos from "./routes/todos.js";
import { getMongoDb, initMongoDb } from "./utils/db.js";

// Body parser
app.use(express.json());

// Attaches db connection to req object
app.use(async (req, res, next) => {
  req.mongoConn = await getMongoDb();
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================== ROUTES ===================

app.get("/", async (req, res) => {
  res.json({
    message: "Welcome to MongoDB Todo List API",
    version: "1.0.0",
  });
});

app.use("/todos", todos);

app.listen(PORT, async () => {
  await initMongoDb();
  console.log(`Server is running on port ${PORT}...`);
});

