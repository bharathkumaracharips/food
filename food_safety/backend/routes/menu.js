const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

// Get weekly menu for a specific hostel
router.get('/weekly/:hostelId', async (req, res) => {
    try {
        const db = getDb();
        const hostelId = req.params.hostelId;

        if (!ObjectId.isValid(hostelId)) {
            return res.status(400).json({ message: 'Invalid hostel ID' });
        }

        const menu = await db.collection('menu').findOne({ 
            hostelId: new ObjectId(hostelId) 
        });

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create or update weekly menu for a specific hostel
router.post('/weekly/:hostelId', async (req, res) => {
    try {
        const db = getDb();
        const hostelId = req.params.hostelId;
        const { menu } = req.body;

        if (!ObjectId.isValid(hostelId)) {
            return res.status(400).json({ message: 'Invalid hostel ID' });
        }

        if (!menu || typeof menu !== 'object') {
            return res.status(400).json({ message: 'Invalid menu data' });
        }

        const result = await db.collection('menu').updateOne(
            { hostelId: new ObjectId(hostelId) },
            { 
                $set: { 
                    menu,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        res.json({ 
            message: result.upsertedCount ? 'Menu created successfully' : 'Menu updated successfully',
            success: true 
        });
    } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 