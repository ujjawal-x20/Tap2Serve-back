const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const tenantHandler = require('../middleware/tenantMiddleware');
const { createBranch, getBranches, updateBranch, deleteBranch, updatePrepTime } = require('../controllers/branchController');

const router = express.Router();

router.use(protect);
router.use(tenantHandler);

router.post('/', createBranch); // Only admin/owner should do this (enforce in frontend or strict RBAC)
router.get('/', getBranches);
router.put('/prep-time', updatePrepTime); // Specific route
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

module.exports = router;
