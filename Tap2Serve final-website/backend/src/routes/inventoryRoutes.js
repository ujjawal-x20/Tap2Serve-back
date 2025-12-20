const express = require('express');
const { getInventory, updateStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const router = express.Router();

router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getInventory);

router.route('/:menuId')
    .put(updateStock);

module.exports = router;
