import dotenv from "dotenv";
import cors from "cors";
import express, { response } from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import databaseClient from "./services/database.mjs";
import { checkMissingField } from "./utils/requestUtils.js";

const HOSTNAME = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;

// setting initial configuration for upload file, web server (express), and cors
const upload = multer({ dest: "uploads/" });
dotenv.config();
const webServer = express();
webServer.use(cors());
webServer.use(express.json());

// code here

webServer.get("/", async (req, res) => {
  res.json("data");
});

webServer.post("/login", async (req, res) => {
  let body = req.body;
  const LOGIN_DATA_KEYS = ["username", "password"];
  const [isCheck, missingFields] = checkMissingField(LOGIN_DATA_KEYS, body);
  if (!isCheck) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }

  const email = await databaseClient
    .db()
    .collection("members")
    .findOne({ email: body.email });
  if (email === null) {
    res.status(401).send("User not found");
    return;
  } else {
    res.json(email);
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.password);

  if (!isPasswordValid) {
    res.status(401).send("Incorrect password");
    return;
  } l

  res.send({ token: createJwt(email) });

});

webServer.post('/signup', async (req , res) => {
  const SIGNUP_DATA_KEY =["fullName", "email", "password", "gender", "dob", "typemem"];
  const body = req.body;
  const [isCheckData,setIsCheckData] = checkMissingField(SIGNUP_DATA_KEY,body);

  if (!isCheckData) {
    res.send(`Missing Fields: ${"".concat(setIsCheckData)}`);
    return;
  } else {
    
  }
})

// initilize web server
const currentServer = webServer.listen(PORT, HOSTNAME, () => {
  console.log(
    `DATABASE IS CONNECTED: NAME => ${databaseClient.db().databaseName}`
  );
  console.log(`SERVER IS ONLINE => http://${HOSTNAME}:${PORT}`);
});

const cleanup = () => {
  currentServer.close(() => {
    console.log(
      `DISCONNECT DATABASE: NAME => ${databaseClient.db().databaseName}`
    );
    try {
      databaseClient.close();
    } catch (error) {
      console.error(error);
    }
  });
};

// cleanup connection such as database
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
