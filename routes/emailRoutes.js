const express = require('express');
const { fetchEmails } = require('../controllers/emailControllers');
const router = express.Router();

router.get('/fetch-emails', async (req, res) => {
  try {
    await fetchEmails();
    res.status(200).json({ message: "Emails fetched and attachments saved!" });
  } catch (err) {
    res.status(500).json({ error: `Got error while fetching mail: ${err.message}` });
  }
});

module.exports = router;
