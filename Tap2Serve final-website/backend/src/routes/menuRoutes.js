const express = require('express');
const { getMenu, createMenuItem, deleteMenuItem, getPublicMenu, updateMenuItem } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { checkFeatureLimit } = require('../middleware/subscriptionMiddleware');
const router = express.Router();

router.get('/public/:restaurantId', getPublicMenu); // Public access

router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getMenu)
    .post(checkFeatureLimit, createMenuItem);

router.route('/:id')
    .put(updateMenuItem)
    .delete(deleteMenuItem);

module.exports = router;
