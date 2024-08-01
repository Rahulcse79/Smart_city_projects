const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("./configuration");
const User = require("./UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { GUIGetEmails, GUISendEmail } = require("./GUIMailServer");
const {
  getCurrentTime,
  SendMailToDepth,
  SendMailToHumidity,
  SendMailToTemperature,
  SendMailToGas,
} = require("./NeoTech");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const IPAddress = process.env.IPAddress || "localhost";

const secretKey = process.env.secretKey || "coral";
const brokerUrl = process.env.NeoTechBrokerUrl || "mqtt://192.46.209.204:1883";

const options = {
  username: process.env.NeoTechOptionsUsername || "root",
  password: process.env.NeoTechOptionsPassword || "Coral@2020##",
};

const client = mqtt.connect(brokerUrl, options);

let data = [];

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("#", (err) => {
    if (err) {
      console.error("Error subscribing to topics:", err);
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    const currentTime = await getCurrentTime();
    const parsedMessage = JSON.parse(message.toString());
    data.push({ topic, message: parsedMessage, currentTime });
    // console.log(`Received message on topic ${topic}:`, parsedMessage);
  } catch (error) {
    console.error("Error parsing message:", error);
  }
});

client.on("error", (error) => {
  console.error("MQTT client error:", error);
  client.end();
});

client.on("close", () => {
  console.log("Disconnected from MQTT broker");
});

const verifyToken = (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  if (!tokenHeader) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided." });
  }
  if (process.env.secretCode === tokenHeader) {
    console.log("Token matched secretCode");
    return next();
  }
  if (!tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }
  const token = tokenHeader.substring(7);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

app.get("/api/data", verifyToken, (req, res) => {
  try {
    const topicHeader = req.headers["topic"];
    const filteredData = data.filter((entry) => entry.topic === topicHeader);
    res.json({ data: filteredData, status: 1 });
  } catch (error) {
    console.error("Error sending data:", error);
    res.status(500).json({ error: "Failed to fetch data", status: -1 });
  }
});

const comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    if (match) {
      return 1;
    } else {
      return -1;
    }
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return -1;
  }
};

app.get("/checkAuth", verifyToken, async (req, resp) => {
  try {
    resp.status(200).json({ message: "Token is valid", success: true });
  } catch (error) {
    resp
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
    console.error(error.message);
  }
});

// Function to hash a password
const hashPasswordFunction = async (password) => {
  try {
    const saltRounds = 10;
    const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) reject(err);
        resolve(hashedPassword);
      });
    });
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }
    if (username === "admin" && password === "neotech") {
      let existingUser = await User.findOne({ username });
      if (!existingUser) {
        const hashedPassword = await hashPasswordFunction(password);
        const newUser = new User({ username, password: hashedPassword });
        existingUser = await newUser.save();
      }
      const passwordMatch = await comparePasswords(
        password,
        existingUser.password
      );

      if (passwordMatch) {
        const authToken = jwt.sign(
          { id: existingUser._id, username: existingUser.username },
          secretKey,
          { expiresIn: "10h" }
        );
        const { password: _, ...userWithoutPassword } = existingUser.toObject();
        return res.status(200).json({
          success: true,
          AuthToken: authToken,
          user: userWithoutPassword,
          message: "Login successful.",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Login failed due to wrong password.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Login failed due to wrong username or password.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
});

// GUI mail api.

app.get("/api/gui/receiveEmails",verifyToken,async (req, res) => {
  await GUIGetEmails((err, emails) => {
    if (err) {
      console.error('Error fetching emails:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch emails', details: err });
    }
    if (!emails || emails.length === 0) {
      return res.status(400).json({ success: false, error: 'No emails found', details: 'No emails available' });
    }
    console.log("Get gui mail success");
    res.json({ success: true, emails });
  });
});

app.post('/api/gui/sendEmail',verifyToken, async(req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  await GUISendEmail(to, subject, text, (err, info) => {
    if (err) {
      console.error('Error sending email:', err); 
      return res.status(500).json({ success: false, error: 'Failed to send email', details: err.toString() });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ success: true, message: 'Email sent successfully', info: info.response });
  });
});

// Gui mail api end.

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to database: ", error);
});

mongoose.connection.once("open", () => {
  console.log("Database connected.");
  app.listen(PORT, IPAddress, () => {
    console.log(`Server is running on http://${IPAddress}:${PORT}`);
  });
});

setInterval(async () => {
  //console.log("Stored Data:", data);
  const LastIndexmappedData = data.map((item) => {
    return item.message;
  });
  const mappedData = LastIndexmappedData[LastIndexmappedData.length - 1];
  // console.log(mappedData);
  if (mappedData) {
    // await SendMailToDepth(mappedData);
    // console.log(OneTimeMail);
    // await SendMailToHumidity(mappedData);
    // await SendMailToTemperature(mappedData);
    // await SendMailToGas(mappedData);
  }
}, 5000);

process.on("SIGINT", () => {
  client.end();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
