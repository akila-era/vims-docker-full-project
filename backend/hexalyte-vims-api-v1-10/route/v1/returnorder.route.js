const express = require('express');
const router = express.Router();
const returnOrderController = require('../../controller/returnorder.controller')

router
    .route('/salesorder')
    .get(returnOrderController.getAllReturnOrders)
    .post(returnOrderController.createReturnSalesOrder);

router
  .route('/salesorder/:id')
  .put(returnOrderController.createReturnSalesOrder);


module.exports = router