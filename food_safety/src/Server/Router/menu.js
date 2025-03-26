import express from 'express';
import Menu from '../Models/Menu.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get weekly menu for a specific hostel
router.get('/weekly/:hostelId', async (req, res) => {
    try {
        const { hostelId } = req.params;
        console.log('Fetching menu for hostelId:', hostelId); // Debug log

        if (!mongoose.Types.ObjectId.isValid(hostelId)) {
            return res.status(400).json({ message: 'Invalid hostel ID format' });
        }

        const menu = await Menu.findOne({ hostelId: new mongoose.Types.ObjectId(hostelId) });
        console.log('Found menu:', menu); // Debug log
        
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found for this hostel' });
        }
        
        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Create or update weekly menu for a specific hostel
router.post('/weekly/:hostelId', async (req, res) => {
    try {
        const { hostelId } = req.params;
        const { menu } = req.body;

        console.log('Received request to save menu:', { hostelId, menu }); // Debug log

        if (!mongoose.Types.ObjectId.isValid(hostelId)) {
            return res.status(400).json({ message: 'Invalid hostel ID format' });
        }

        if (!menu || typeof menu !== 'object') {
            return res.status(400).json({ message: 'Invalid menu data' });
        }

        // Validate menu structure
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const meals = ['breakfast', 'lunch', 'dinner'];
        
        for (const day of days) {
            if (!menu[day]) {
                return res.status(400).json({ message: `Menu for ${day} is missing` });
            }
            for (const meal of meals) {
                if (!menu[day][meal]) {
                    return res.status(400).json({ message: `${meal} for ${day} is missing` });
                }
            }
        }

        const updatedMenu = await Menu.findOneAndUpdate(
            { hostelId: new mongoose.Types.ObjectId(hostelId) },
            { menu },
            { new: true, upsert: true }
        );

        console.log('Saved menu:', updatedMenu); // Debug log

        res.json({
            message: 'Menu updated successfully',
            menu: updatedMenu
        });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Get today's menu for a specific hostel
router.get('/today/:hostelId', async (req, res) => {
    try {
        const { hostelId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(hostelId)) {
            return res.status(400).json({ message: 'Invalid hostel ID format' });
        }

        const menu = await Menu.findOne({ hostelId: new mongoose.Types.ObjectId(hostelId) });
        
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found for this hostel' });
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        
        res.json({
            day: today,
            menu: menu.menu[today]
        });
    } catch (error) {
        console.error('Error fetching today\'s menu:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default router; 