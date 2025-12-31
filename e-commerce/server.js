import express from 'express'
import { initSqlDb , initMongoDb, getMongoDb, getConnSql} from './utils/mysql';

const app = express();
const PORT = 8000;


app.use(express.json());

app.use(async (req, res, next) => {
  req.mongoConn = await getMongoDb();
  req.sqlConn = await getConnSql();
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", async (req, res) => {
  res.json({
    message: "Welcome to MongoDB and SQL List API",
    version: "1.0.0",
  });
});


app.listen(PORT, async () => {
  await initMongoDb();
  await initSqlDb();
  console.log(`Server is running on port ${PORT}...`);
});
