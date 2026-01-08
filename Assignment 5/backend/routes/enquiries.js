const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Enquiry = require('../models/Enquiry');

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// GET All Enquiries
router.get('/', auth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ user: req.user }).sort({ date: -1 });
        res.json(enquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST Create Enquiry
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, phone, course, message } = req.body;
        const newEnquiry = new Enquiry({
            user: req.user,
            name,
            email,
            phone,
            course,
            message
        });
        const enquiry = await newEnquiry.save();
        res.json(enquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT Update Enquiry
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, email, phone, course, message, status } = req.body;

        let enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });

        // Make sure user owns enquiry
        if (enquiry.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const enquiryFields = {};
        if (name) enquiryFields.name = name;
        if (email) enquiryFields.email = email;
        if (phone) enquiryFields.phone = phone;
        if (course) enquiryFields.course = course;
        if (message) enquiryFields.message = message;
        if (status) enquiryFields.status = status;

        enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { $set: enquiryFields },
            { new: true }
        );

        res.json(enquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE Enquiry
router.delete('/:id', auth, async (req, res) => {
    try {
        let enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });

        if (enquiry.user.toString() !== req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Enquiry.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Enquiry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
