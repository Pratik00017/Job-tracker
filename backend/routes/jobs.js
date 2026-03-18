const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Get all jobs for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user }).sort({ appliedDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a job
router.post('/', auth, async (req, res) => {
  try {
    const job = new Job({ ...req.body, user: req.user });
    await job.save();
    res.json(job);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
  try {
    await Job.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;