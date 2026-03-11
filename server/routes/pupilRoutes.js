const express = require('express');
const router = express.Router();
const { getPupils, createPupil, getSchoolStructure } = require('../controllers/pupilController');

router.get('/', getPupils);
router.post('/', createPupil);
router.get('/school-structure', getSchoolStructure);

module.exports = router;
