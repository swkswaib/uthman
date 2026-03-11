const express = require('express');
const router = express.Router();
const { getMarks, enterMarks, bulkEnterMarks } = require('../controllers/markController');

router.get('/', getMarks);
router.post('/', enterMarks);
router.post('/bulk', bulkEnterMarks);

module.exports = router;
