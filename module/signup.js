import bcrypt from 'bcrypt'; // Make sure to import the bcrypt library
import { checkMissingField } from '../utils/requestUtils.js'; // Import the checkMissingField function
import databaseClient from '../services/database.mjs'; // Import the databaseClient

// Define the signup function
const DATA_KEY_SIGNUP = ["fullName", "email", "password", "gender", "dob", "phoneNumber", "typemem"];

const signupRoute = async (req, res) => {
  let body = req.body;

  const [isChecked , setISsChecked] = checkMissingField(DATA_KEY_SIGNUP,body);

  if (!isChecked) {
    res.send(`Missing Fields: ${"".concat(setISsChecked)}`);
    return;
  }

  const SALT = 10;
  const saltRound = await bcrypt.genSalt(SALT);
  body["password"] = await bcrypt.hash(body["password"], saltRound);

  await databaseClient.db().collection("members").insertOne(body);

  res.send(body);
};

export default signupRoute;