const imaps = require("imap-simple");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const emailRegex = /<([^>]+)>/;

const fetchEmails = async () => {
  const config = {
   
    imap: {
      user: process.env.EMAIL,
      password: process.env.PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 10000,
      // debug: console.log,
      tlsOptions: { rejectUnauthorized: false },
    },
  };

  try {
    const connection = await imaps.connect(config);
    console.log("IMAP connection successful!");

    await connection.openBox("INBOX");
    // const searchCriteria = ['FLAGGED'];
    const date = new Date("2024-12-09");
    const formattedDate = date.toISOString().split("T")[0];
    const searchCriteria = [["ON", formattedDate]];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const senderEmails = new Set(); // To store unique sender emails

    for (let message of messages) {
      const allHeaders = message.parts.find((part) => part.which === "HEADER");
      const fromEmail = await allHeaders.body.from[0];
      const emailMatch = fromEmail.match(emailRegex);
      const senderEmailAddress = emailMatch ? emailMatch[1] : null;

      // Save sender email to set
      senderEmails.add(senderEmailAddress);
      console.log("see sender email>>>", senderEmails);
    }
    for (let message of messages) {
      const parts = imaps.getParts(message.attributes.struct);
      const attachments = parts.filter(
        (part) => part.disposition && part.disposition.type === "ATTACHMENT"
      );

      for (let attachment of attachments) {
        const attachmentStream = await connection.getPartData(
          message,
          attachment
        );
        const outputPath = path.join(
          __dirname,
          "../uploads",
          attachment.params.name
        );
        fs.writeFileSync(outputPath, attachmentStream);
        console.log(`Attachment saved: ${outputPath}`);
      }
    }
    connection.end();
    console.log('connection ended');
    console.log("All sender emails:", [...senderEmails]);

    return [...senderEmails]; // Return sender email list
  } catch (err) {
    console.error("Error fetching emails:", err);
  }
};

const sendEmailWithAttachment = async (filePath) => {
  try {
    // Step 1: Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nitishofficial424@gmail.com",
        pass: "xpxc pyue odgz uwvd",
      },
    });

    // Step 2: Define email options
    const mailOptions = {
      from: "nitishofficial424@gmail.com",
      to: "cloudservice424@gmail.com",
      subject: "Consolidated RCM Data",
      text: "Please find the attached consolidated production report.",
      attachments: [
        {
          filename: "combined_data.xlsx",
          path: filePath,
        },
      ],
    };

    // Step 3: Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};

const sendSummaryReport = async (filePath, recipients) => {
  console.log('check my recipents',recipients);
  try {
    // Step 1: Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nitishofficial424@gmail.com",
        pass: "xpxc pyue odgz uwvd",
      },
    });

    // Step 2: Define email options
    const mailOptions = {
      from: "nitishofficial424@gmail.com",
      to: recipients.join(","), // List of team member emails
      subject: "Team Summary Report",
      text: "Please find the attached summary report of today's production.",
      attachments: [
        {
          filename: "team_summary.xlsx",
          path: filePath,
        },
      ],
    };

    // Step 3: Send the email
    await transporter.sendMail(mailOptions);
    console.log("Summary report sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};

module.exports = { fetchEmails, sendEmailWithAttachment, sendSummaryReport };
