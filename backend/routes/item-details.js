const express = require('express');
const router = express.Router();
const controller = require('../controllers/item-detail.controller');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.get('/item/:itemName', controller.listByItemName);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

