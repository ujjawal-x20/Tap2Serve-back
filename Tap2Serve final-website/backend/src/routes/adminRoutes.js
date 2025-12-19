const express = require('express');
const {
    approveUser,
    getPendingMenu,
    approveMenu,
    rejectMenu,
    getUsers,
    createUser,
    deleteUser,
    getLogs,
    getConfig,
    updateConfig
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/approve', approveUser);
router.get('/menu/pending', getPendingMenu);
router.put('/menu/:id/approve', approveMenu);
router.delete('/menu/:id/reject', rejectMenu);
router.get('/logs', getLogs);
router.get('/config', getConfig);
router.post('/config', updateConfig);

module.exports = router;
