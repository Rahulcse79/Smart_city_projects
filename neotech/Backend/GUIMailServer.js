const nodemailer = require("nodemailer");
const Imap = require("imap-simple");

const config = {
  imap: {
    user: process.env.configUser || "admin@coraltele.com",
    password: process.env.configPassword || "admin123",
    host: process.env.configHost || "mail.coraltele.com",
    port: process.env.configPort || 993,
    tls: process.env.configTls || true,
    authTimeout: 3000,
  },
};

const transporter = nodemailer.createTransport({
  host: process.env.transporterHost || "mail.coraltele.com",
  port: process.env.transporterPort || 587,
  secure: process.env.transporterSecure === false ? false : false,
  auth: {
    user: process.env.transporterUser || "akash.vishwakarma@coraltele.com",
    pass: process.env.transporterPass || "Akash@3211",
  },
});

async function GUISendEmail(to, subject, text, callback) {
  try {
    let mailOptions = {
      from: 'akash.vishwakarma@coraltele.com',
      to: to,
      subject: subject,
      text: text
    };

    let info = await transporter.sendMail(mailOptions);
    callback(null, info);

  } catch (error) {
    callback(error);
  }
}

async function GUIGetEmails(callback) {
  try {
    const connection = await Imap.connect(config);
    await connection.openBox("INBOX");
    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
    };
    const results = await connection.search(searchCriteria, fetchOptions);
    results.sort((a, b) => {
      const dateA = new Date(a.attributes.date);
      const dateB = new Date(b.attributes.date);
      return dateB - dateA;
    });
    connection.end();
    callback(null, results);
  } catch (err) {
    console.error('Error fetching emails:', err);
    callback(err, null);
  }
}

module.exports = { GUIGetEmails, GUISendEmail };
