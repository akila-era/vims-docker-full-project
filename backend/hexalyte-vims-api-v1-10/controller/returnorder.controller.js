const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const returnOrderServices = require('../service/returnorders.service')

const getAllReturnOrders = catchAsync(async (req, res) => {

    const allReturnOrders = await returnOrderServices.getAllReturnOrders()

    return res.send({ allReturnOrders })

})

const createReturnSalesOrder = catchAsync(async (req, res) => {

    // const newReturnSalesOrder = await returnOrderServices.createReturnSalesOrder(req.body)
    const orderId = req.params.id;
    const updatedSalesorder = await returnOrderServices.createReturnSalesOrder(orderId, req.body);
    return res.send({ updatedSalesorder })

})

module.exports = { createReturnSalesOrder, getAllReturnOrders }