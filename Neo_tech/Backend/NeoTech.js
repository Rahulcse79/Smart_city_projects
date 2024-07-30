const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

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

app.get("/api/data", (req, res) => {
  try {
    const topicHeader = req.headers['topic'];
    const filteredData = data.filter(entry => entry.topic === topicHeader);
    res.json({ data: filteredData, status: 1 });
  } catch (error) {
    console.error("Error sending data:", error);
    res.status(500).json({ error: "Failed to fetch data", status: -1 });
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

const PORT = process.env.PORT || 3023;


const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

setInterval(() => {
  console.log("Stored Data:", data);
}, 5000);

process.on("SIGINT", () => {
  client.end();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
