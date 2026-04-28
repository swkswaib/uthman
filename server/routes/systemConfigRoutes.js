const express = require('express');
const router = express.Router();
const {
  getSystemConfiguration,
  updateSystemConfiguration
} = require('../controllers/systemConfigController');

router.get('/', getSystemConfiguration);
router.put('/', updateSystemConfiguration);

module.exports = router;