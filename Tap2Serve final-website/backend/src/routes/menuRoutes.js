const express = require('express');
const { getMenu, createMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { checkFeatureLimit } = require('../middleware/subscriptionMiddleware');
const router = express.Router();

router.use(protect);
router.use(tenantHandler);

router.route('/')
    .get(getMenu)
    .post(checkFeatureLimit, createMenuItem);

router.route('/:id')
    .delete(deleteMenuItem);

module.exports = router;
