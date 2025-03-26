import express from 'express';
import { getWeeklyMenu, updateWeeklyMenu, getTodayMenu } from '../Controller/menuController.js';

const router = express.Router();

// Get weekly menu for a specific hostel
router.get('/weekly/:hostelId', getWeeklyMenu);

// Create or update weekly menu for a specific hostel
router.post('/weekly/:hostelId', updateWeeklyMenu);

// Get today's menu for a specific hostel
router.get('/today/:hostelId', getTodayMenu);

export default router; 