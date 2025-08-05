const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const returnOrderServices = require('../service/returnorders.service')

const createReturnSalesOrder = catchAsync(async (req, res) => {

    const newReturnSalesOrder = await returnOrderServices.createReturnSalesOrder(req.body)

    return res.send({ newReturnSalesOrder })

})

module.exports = { createReturnSalesOrder }