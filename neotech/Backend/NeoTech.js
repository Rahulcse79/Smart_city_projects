const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.coraltele.com",
  port: 465,
  secure: true,
  auth: {
    user: "basima.gayas@coraltele.com",
    pass: "$#%Basu&$#2222",
  },
});

// Function to send email
const SendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

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

let OneTimeMail = {
  empty: false,
  half: false,
  full: false,
};

let OneTimeMailHumidity = {
  low: false,
  medium: false,
  high: false,
};

let OneTimeMailOfGas = {
  low: false,
  medium: false,
  high: false,
};

let OneTimeMailTemperature = {
  low: false,
  medium: false,
  high: false,
};

const SendMailToDepth = async (mappedData) => {
  const mailOptions1 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Dustbin Empty",
    text: "The dustbin is currently empty. Please take necessary action.",
  };

  const mailOptions2 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Dustbin 50% Full",
    text: "The dustbin is 50% full. Consider scheduling a pickup soon.",
  };

  const mailOptions3 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Dustbin 80% Full",
    text: "The dustbin is 80% full. It requires immediate attention for emptying.",
  };

  let result;

  if (mappedData.fill_level === 0 && OneTimeMail.empty === false) {
    result = await SendMail(mailOptions1);
    OneTimeMail.empty = true;
    OneTimeMail.half = false;
    OneTimeMail.full = false;
  } else if (
    mappedData.fill_level >= 50 &&
    mappedData.fill_level < 80 &&
    OneTimeMail.half === false
  ) {
    result = await SendMail(mailOptions2);
    OneTimeMail.empty = false;
    OneTimeMail.half = true;
    OneTimeMail.full = false;
  } else if (mappedData.fill_level >= 80 && OneTimeMail.full === false) {
    result = await SendMail(mailOptions3);
    OneTimeMail.empty = false;
    OneTimeMail.half = false;
    OneTimeMail.full = true;
  }
  return result;
};

const SendMailToHumidity = async (mappedData) => {
  const mailOptions1 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Humidity Low",
    text: "Humidity levels are low. Consider adjusting the environment as necessary.",
  };

  const mailOptions2 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Humidity Moderate",
    text: "Humidity levels are moderate. Monitor the environment closely.",
  };

  const mailOptions3 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Humidity High",
    text: "Humidity levels are high. Take immediate action to mitigate risks.",
  };

  let result;

  if (mappedData.humidity <= 30 && OneTimeMailHumidity.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailHumidity.low = true;
    OneTimeMailHumidity.medium = false;
    OneTimeMailHumidity.high = false;
  } else if (
    mappedData.humidity >= 40 &&
    mappedData.humidity <= 70 &&
    OneTimeMailHumidity.medium === false
  ) {
    result = await SendMail(mailOptions2);
    OneTimeMailHumidity.low = false;
    OneTimeMailHumidity.medium = true;
    OneTimeMailHumidity.high = false;
  } else if (mappedData.humidity > 70 && OneTimeMailHumidity.high === false) {
    result = await SendMail(mailOptions3);
    OneTimeMailHumidity.low = false;
    OneTimeMailHumidity.medium = false;
    OneTimeMailHumidity.high = true;
  }

  return result;
};

const SendMailToTemperature = async (mappedData) => {
  const mailOptions1 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Temperature Low",
    text: "Temperature is low. Adjust the environment as necessary.",
  };

  const mailOptions2 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Temperature Moderate",
    text: "Temperature is moderate. Monitor the environment closely.",
  };

  const mailOptions3 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Temperature High",
    text: "Temperature is high. Take immediate action to mitigate risks.",
  };

  let result;

  if (mappedData.temperature <= 10 && OneTimeMailTemperature.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailTemperature.low = true;
    OneTimeMailTemperature.medium = false;
    OneTimeMailTemperature.high = false;
  } else if (
    mappedData.temperature >= 20 &&
    mappedData.temperature <= 30 &&
    OneTimeMailTemperature.medium === false
  ) {
    result = await SendMail(mailOptions2);
    OneTimeMailTemperature.low = false;
    OneTimeMailTemperature.medium = true;
    OneTimeMailTemperature.high = false;
  } else if (
    mappedData.temperature > 30 &&
    OneTimeMailTemperature.high === false
  ) {
    result = await SendMail(mailOptions3);
    OneTimeMailTemperature.low = false;
    OneTimeMailTemperature.medium = false;
    OneTimeMailTemperature.high = true;
  }

  return result;
};

const SendMailToGas = async (mappedData) => {
  const mailOptions1 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Gas Sensor Low",
    text: "Gas sensor readings indicate low levels. Please check and refill as necessary.",
  };

  const mailOptions2 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Gas Sensor Medium",
    text: "Gas sensor readings indicate medium levels. Monitor the situation closely.",
  };

  const mailOptions3 = {
    from: "basima.gayas@coraltele.com",
    to: "rishi.saini@coraltele.com",
    subject: "Automated Notification: Gas Sensor High",
    text: "Gas sensor readings indicate high levels. Take immediate action to mitigate risks.",
  };

  let result;

  if (mappedData.air_quality <= 100 && OneTimeMailOfGas.low === false) {
    result = await SendMail(mailOptions1);
    OneTimeMailOfGas.low = true;
    OneTimeMailOfGas.medium = false;
    OneTimeMailOfGas.high = false;
  } else if (
    mappedData.air_quality >= 300 &&
    mappedData.gas_level <= 400 &&
    OneTimeMailOfGas.medium === false
  ) {
    result = await SendMail(mailOptions2);
    OneTimeMailOfGas.low = false;
    OneTimeMailOfGas.medium = true;
    OneTimeMailOfGas.high = false;
  } else if (mappedData.air_quality >= 500 && OneTimeMailOfGas.high === false) {
    result = await SendMail(mailOptions3);
    OneTimeMailOfGas.low = false;
    OneTimeMailOfGas.medium = false;
    OneTimeMailOfGas.high = true;
  }

  return result;
};

module.exports = {
  getCurrentTime,
  SendMailToDepth,
  SendMailToHumidity,
  SendMailToTemperature,
  SendMailToGas
};
