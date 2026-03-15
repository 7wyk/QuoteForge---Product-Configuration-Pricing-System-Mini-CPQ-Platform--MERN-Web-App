const express = require('express');
const {
  getUsers,
  updateUser,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getAdminOverview,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

module.exports = router;
