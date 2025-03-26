import Menu from '../Models/Menu.js';

// Get weekly menu for a specific hostel
const getWeeklyMenu = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const menu = await Menu.findOne({ hostelId });
        
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found for this hostel' });
        }
        
        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create or update weekly menu for a specific hostel
const updateWeeklyMenu = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const { menu } = req.body;

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
            { hostelId },
            { menu },
            { new: true, upsert: true }
        );

        res.json({
            message: 'Menu updated successfully',
            menu: updatedMenu
        });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get today's menu for a specific hostel
const getTodayMenu = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const menu = await Menu.findOne({ hostelId });
        
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
        res.status(500).json({ message: 'Internal server error' });
    }
};

export { getWeeklyMenu, updateWeeklyMenu, getTodayMenu }; 