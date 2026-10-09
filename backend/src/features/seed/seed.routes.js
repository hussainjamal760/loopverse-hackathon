const express = require('express');
const { seedDatabase } = require('./seed.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await seedDatabase();
    return res.json({
      success: true,
      message: 'Database seeded successfully',
      result,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase();
    return res.json({
      success: true,
      message: 'Database seeded successfully',
      result,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
