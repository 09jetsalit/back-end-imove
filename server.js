import dotenv from "dotenv";
import cors from "cors";
import express, { response } from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import databaseClient from "./services/database.mjs";
import { checkMissingField } from "./utils/requestUtils.js";
import bcrypt from "bcrypt";
import signupRoute from "./module/signup.js"
import jwt from "jsonwebtoken";




const HOSTNAME = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;

// setting initial configuration for upload file, web server (express), and cors
const upload = multer({ dest: "uploads/" });
dotenv.config();
const webServer = express();
webServer.use(cors());
webServer.use(express.json());

// code here
webServer.post("/signup", signupRoute);

webServer.post("/login", async (req, res) => {
  let body = req.body;
  const LOGIN_DATA_KEYS = ["email" , "password"]
  const [isBodyChecked, missingFields] = checkMissingField(
    LOGIN_DATA_KEYS,
    body
  );
  console.log(body);

  if (!isBodyChecked) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }

  const user = await databaseClient
    .db()
    .collection("members")
    .findOne({ email: body.email });
  if (user === null) {
    res.send("User or Password invalid");
    return;
  }
  // hash password
  if (!bcrypt.compareSync(body.password, user.password)) {
    res.send("E-Mail or Password invalid");
    return;
  }
  res.json({ token: createJwt(body.email) });


  ///////////////////////////////////////////
  function createJwt(email) {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const data = { email: email }
    const token = jwt.sign(data, jwtSecretKey, {
      expiresIn: "7d",
    });
  
    return token;
  }

});





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
