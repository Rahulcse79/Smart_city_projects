const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');
require("./configuration");
const User = require("./UserSchema");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const secretKey = "NeoTech";
const brokerUrl = "mqtt://192.46.209.204:1883";
const options = {
  username: "root",
  password: "Coral@2020##",
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

client.on("message", async(topic, message) => {
  try {
    const currentTime = await getCurrentTime();
    const parsedMessage = JSON.parse(message.toString());
    data.push({ topic, message: parsedMessage, currentTime });
    console.log(`Received message on topic ${topic}:`, parsedMessage);
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
  const tokenHeader = req.header('Authorization');
  if (!tokenHeader) {
    return res.status(401).json({ message: 'Access denied, No token provided.' });
  } 
  if (!tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  const token = tokenHeader.substring(7); 
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

app.get("/api/data", verifyToken,(req, res) => {
  try {
    const topicHeader = req.headers['topic'];
    const filteredData = data.filter(entry => entry.topic === topicHeader);
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
    resp.status(200).json({ message: "Token is valid", success: true});
  } catch (error) {
    resp.status(500).json({ success: false, message: "Internal Server Error." });
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

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    // Simulate user check for demo purposes (replace with actual database query)
    if (username === "admin" && password === "neotech") {
      // Find existing user in the database
      let existingUser = await User.findOne({ username });

      // If user doesn't exist, create a new user with hashed password
      if (!existingUser) {
        const hashedPassword = await hashPasswordFunction(password);
        const newUser = new User({ username, password: hashedPassword });
        existingUser = await newUser.save();
      }

      // Compare passwords
      const passwordMatch = await comparePasswords(password, existingUser.password);

      if (passwordMatch) {
        // Generate JWT token
        const authToken = jwt.sign({ id: existingUser._id, username: existingUser.username }, secretKey, { expiresIn: '10h' });

        // Omit password from response
        const { password: _, ...userWithoutPassword } = existingUser.toObject();

        // Send success response with AuthToken
        return res.status(200).json({
          success: true,
          AuthToken: authToken,
          user: userWithoutPassword,
          message: "Login successful."
        });
      } else {
        // Incorrect password
        return res.status(400).json({ success: false, message: "Login failed due to wrong password." });
      }
    } else {
      // Incorrect username or password
      return res.status(400).json({ success: false, message: "Login failed due to wrong username or password." });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

const getCurrentTime = async () => {
  try {
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let seconds = currentTime.getSeconds();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  } catch (error) {
    console.error("Error getting current time:", error);
    throw error;
  }
};

const transporter = nodemailer.createTransport({
  host: 'mail.coraltele.com',
  port: 465, 
  secure: true, 
  auth: {
    user: 'basima.gayas@coraltele.com',
    pass: '$#%Basu&$#2222'
  }
});

// Function to send email
const SendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

app.post('/sendEmail', async (req, res) => {
  try {
    const { text, subject, to } = req.body;
    if (!text || !subject || !to) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    const mailOptions = {
      from: 'basima.gayas@coraltele.com',
      to: to,
      subject: subject,
      text: text
    };
    const result = await SendMail(mailOptions);
    res.status(200).json({result, success: true});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

let OneTimeMail = {
  empty: false,
  half: false,
  full: false
}

let OneTimeMailHumidity = {
  low: false,
  medium: false,
  high: false
}

let OneTimeMailOfGas = {
  low: false,
  medium: false,
  high: false
}

let OneTimeMailTemperature = {
  low: false,
  medium: false,
  high: false
}

const SendMailToDepth = async () => {
  const mailOptions1 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Dustbin Empty",
    text: "The dustbin is currently empty. Please take necessary action."
  };

  const mailOptions2 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Dustbin 50% Full",
    text: "The dustbin is 50% full. Consider scheduling a pickup soon."
  };

  const mailOptions3 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Dustbin 80% Full",
    text: "The dustbin is 80% full. It requires immediate attention for emptying."
  };

  let result;

  if (data.fill_level === 0 && OneTimeMail.empty === false) {
    result = await SendMail(mailOptions1);
    OneTimeMail.empty = true;
    OneTimeMail.half = false;
    OneTimeMail.full = false;
  } else if (data.fill_level >= 50 && data.fill_level < 80 && OneTimeMail.half === false) {
    result = await SendMail(mailOptions2);
    OneTimeMail.empty = false;
    OneTimeMail.half = true;
    OneTimeMail.full = false;
  } else if (data.fill_level >= 80 && OneTimeMail.full === false) {
    result = await SendMail(mailOptions3);
    OneTimeMail.empty = false;
    OneTimeMail.half = false;
    OneTimeMail.full = true;
  }
  return result;
};

const SendMailToHumidity = async () => {
  const mailOptions1 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Humidity Low",
    text: "Humidity levels are low. Consider adjusting the environment as necessary."
  };

  const mailOptions2 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Humidity Moderate",
    text: "Humidity levels are moderate. Monitor the environment closely."
  };

  const mailOptions3 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Humidity High",
    text: "Humidity levels are high. Take immediate action to mitigate risks."
  };

  let result;

  if (data.humidity <= 30 && OneTimeMailHumidity.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailHumidity.low = true;
    OneTimeMailHumidity.medium = false;
    OneTimeMailHumidity.high = false;
  } else if (data.humidity >= 40 && data.humidity_level <= 70 && OneTimeMailHumidity.medium === false) {
    result = await SendMail(mailOptions2);
    OneTimeMailHumidity.low = false;
    OneTimeMailHumidity.medium = true;
    OneTimeMailHumidity.high = false;
  } else if (data.humidity > 70 && OneTimeMailHumidity.high === false) {
    result = await SendMail(mailOptions3);
    OneTimeMailHumidity.low = false;
    OneTimeMailHumidity.medium = false;
    OneTimeMailHumidity.high = true;
  }

  return result;
};

const SendMailToTemperature = async () => {
  const mailOptions1 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Temperature Low",
    text: "Temperature is low. Adjust the environment as necessary."
  };

  const mailOptions2 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Temperature Moderate",
    text: "Temperature is moderate. Monitor the environment closely."
  };

  const mailOptions3 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Temperature High",
    text: "Temperature is high. Take immediate action to mitigate risks."
  };

  let result;

  if (data.temperature <= 10 && OneTimeMailTemperature.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailTemperature.low = true;
    OneTimeMailTemperature.medium = false;
    OneTimeMailTemperature.high = false;
  } else if (data.temperature >= 20 && data.temperature <= 30 && OneTimeMailTemperature.medium === false) {
    result = await SendMail(mailOptions2);
    OneTimeMailTemperature.low = false;
    OneTimeMailTemperature.medium = true;
    OneTimeMailTemperature.high = false;
  } else if (data.temperature > 30 && OneTimeMailTemperature.high === false) {
    result = await SendMail(mailOptions3);
    OneTimeMailTemperature.low = false;
    OneTimeMailTemperature.medium = false;
    OneTimeMailTemperature.high = true;
  }

  return result;
};

const SendMailToGas = async () => {
  const mailOptions1 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Gas Sensor Low",
    text: "Gas sensor readings indicate low levels. Please check and refill as necessary."
  };

  const mailOptions2 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Gas Sensor Medium",
    text: "Gas sensor readings indicate medium levels. Monitor the situation closely."
  };

  const mailOptions3 = {
    from: 'basima.gayas@coraltele.com',
    to: "rahul.singh@coraltele.com",
    subject: "Automated Notification: Gas Sensor High",
    text: "Gas sensor readings indicate high levels. Take immediate action to mitigate risks."
  };

  let result;

  if (data.air_quality <= 100 && OneTimeMailOfGas.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailOfGas.low = true;
    OneTimeMailOfGas.medium = false;
    OneTimeMailOfGas.high = false;
  } else if (data.air_quality >= 300 && data.gas_level <= 400 && OneTimeMailOfGas.medium === false) {
    result = await SendMail(mailOptions2);
    OneTimeMailOfGas.low = false;
    OneTimeMailOfGas.medium = true;
    OneTimeMailOfGas.high = false;
  } else if (data.air_quality >= 500 && OneTimeMailOfGas.high === false) {
    result = await SendMail(mailOptions3);
    OneTimeMailOfGas.low = false;
    OneTimeMailOfGas.medium = false;
    OneTimeMailOfGas.high = true;
  }

  return result;
};

const PORT = process.env.PORT || 3023;

mongoose.connection.on('error', (error) => {
  console.error('Error connecting to database: ', error);
});

mongoose.connection.once('open', () => {
  console.log('Database connected.');
  app.listen(PORT, () => {
      console.log('Server is running on port:', PORT);
  });
});;

setInterval(() => {
  //console.log("Stored Data:", data);
  SendMailToDepth();
  SendMail();
  SendMailToHumidity();
  SendMailToTemperature();
  SendMailToGas();
}, 1000);

process.on("SIGINT", () => {
  client.end();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
