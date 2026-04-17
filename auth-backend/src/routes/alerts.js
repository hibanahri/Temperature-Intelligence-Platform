const express = require('express');
const { sendTemperatureAlert } = require('../config/email');

const router = express.Router();

// Send temperature alert email
router.post('/send', async (req, res) => {
  try {
    const { email, temperature, threshold, alert_type, room, timestamp } = req.body;

    if (!email || !temperature || !threshold || !alert_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendTemperatureAlert(email, {
      temperature,
      threshold,
      alertType: alert_type,
      room,
      timestamp
    });

    res.json({ message: 'Alert email sent successfully' });
  } catch (error) {
    console.error('Alert email error:', error);
    res.status(500).json({ error: 'Failed to send alert email' });
  }
});

module.exports = router;
