// app.js

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sendOtp = require("./utilities/sendOtp");

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB connection string
const dbConnectionString = "mongodb+srv://DSYASWANTH:p21J9xePZlmXUJrE@cluster0.gwgsuah.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB using the connection string
mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a schema for users
const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
});

// Define a model based on the schema
const User = mongoose.model("User", userSchema);

// Route to send OTP
app.post("/sendotp", async (req, res) => {
  const { mobile } = req.body;
  try {
    const otp = await sendOtp(mobile);
    // Save user to database or update existing user's OTP
    await User.findOneAndUpdate(
      { mobile },
      { mobile, otp },
      { upsert: true }
    );
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to verify OTP
app.post("/verifyotp", async (req, res) => {
  const { mobile, otp } = req.body;
  try {
    const user = await User.findOne({ mobile, otp });
    if (user) {
      // User verified successfully
      res.json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// app.get("/",)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
