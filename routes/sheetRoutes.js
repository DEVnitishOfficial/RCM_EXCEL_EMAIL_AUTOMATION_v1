const express = require('express');
const { generateCombinedSheet } = require('../controllers/sheetController');
// const { sendEmailWithAttachment } = require('../controllers/emailControllers');

const { generateSummaryReport } = require('../controllers/sheetController');
const { sendSummaryReport } = require('../controllers/emailControllers');

const router = express.Router();

router.get('/generate-combined-sheet', async (req, res) => {
  try {
    const filePath = await generateCombinedSheet();

    // Step 2: Send the combined sheet as an email
    // await sendEmailWithAttachment(filePath);
    res.status(200).json({ message: 'Combined sheet generated and mailed successfully!',filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/generate-summary', async (req, res) => {
  try {
    // Step 1: Generate the summary report
    const filePath = await generateSummaryReport();

    // Step 2: List of recipients (team members)
    // const recipients = ['cloudservice424@gmail.com','hidummymail@gmail.com','nitish.naroun123@gmail.com']; 

    // Step 3: Send the summary report
    // await sendSummaryReport(filePath, recepient);

    res.status(200).json({ message: 'Summary report generated and emailed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
