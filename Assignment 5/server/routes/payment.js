const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Electricity Plans Data (Hardcoded for logic as plans are usually static or fetched from another collection)
const PLANS = [
    { name: 'Basic Plan', pricePerUnit: 5, unitsIncluded: 100 },
    { name: 'Standard Plan', pricePerUnit: 7, unitsIncluded: 200 },
    { name: 'Premium Plan', pricePerUnit: 10, unitsIncluded: 500 }
];

router.post('/paybill', async (req, res) => {
    try {
        const { consumerId, consumerName, planName, unitsUsed } = req.body;

        // Find the plan details
        const plan = PLANS.find(p => p.name === planName);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        let totalCost = 0;
        let remainingUnits = 0;

        // Logic for calculation
        // If unitsUsed <= unitsIncluded, maybe fixed price? 
        // Usually "Price per Unit" implies Pay-Per-Use or Over-Limit.
        // Let's assume: Price per Unit * Units Used.
        // Or maybe "Units Included" means free units?
        // User description: "Price per Unit", "Units Included".
        // Let's assume:
        // If usage > included, pay for extra? Or is it a prepaid plan where you get X units?
        // "Prepaid electricity plans".
        // Let's go with: You buy a plan. It includes X units. 
        // If you used Y units, do we calculate cost?
        // The "Pay Bill" button implies paying for what you used.
        // Let's simplify: Cost = unitsUsed * plan.pricePerUnit. (Basic logic)
        // AND we calculate remaining units if the plan had a limit.

        // Actually, simplify logic as per typical assignments:
        totalCost = unitsUsed * plan.pricePerUnit;
        remainingUnits = Math.max(0, plan.unitsIncluded - unitsUsed);

        const newBill = new Bill({
            consumerId,
            consumerName,
            planName,
            unitsUsed,
            totalCost,
            remainingUnits,
            paymentStatus: 'Success'
        });

        await newBill.save();

        res.status(200).json({
            success: true,
            message: 'Bill paid successfully',
            data: {
                consumerId,
                consumerName,
                planName,
                unitsUsed,
                totalCost,
                remainingUnits,
                paymentStatus: 'Success'
            }
        });
    } catch (error) {
        console.error('Error paying bill:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
