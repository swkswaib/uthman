const express = require('express');
const router = express.Router();
const { generatePupilReport, generateClassReports, getReportStatistics } = require('../controllers/reportController');

router.get('/pupil/:pupilId', generatePupilReport);
router.get('/class', generateClassReports);
router.get('/statistics', getReportStatistics);

module.exports = router;
