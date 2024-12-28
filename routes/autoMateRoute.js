const express = require('express');
const { autoProcessReports } = require('../controllers/combinedController');
const router = express.Router();

console.log('we reach till autogenRoutes')
router.get('/auto-generate', autoProcessReports);

module.exports = router;
