const db = require('../models')
const SalesOrders = db.salesorder
const SalesOrderDetails = db.salesorderdetail
const ReturnOrders = db.returnorders
const User = db.user

const createReturnSalesOrder = async (params) => {

    const { SalesOrderID, ReturnDate, Reason, CreatedBy, ReturnItems } = params

    const checkUser = await User.findAll({ where: { id: CreatedBy } })

    if (checkUser == null || checkUser.length == 0) {
        return "no user with matching id found"
    }

    const checkSalesOrder = await SalesOrders.findAll({ where: { OrderID: SalesOrderID } })

    if (checkSalesOrder == null || checkSalesOrder.length == 0) {
        return "no sales orders found"
    }

    const checkSalesOrderItems = await SalesOrderDetails.findAll({ where: { OrderID: SalesOrderID } })

    if (checkSalesOrderItems == null || checkSalesOrderItems.length == 0) {
        return "no sales order items"
    }

    // const createReturnSalesOrder = await ReturnOrders.create({ SalesOrderID, ReturnDate, Reason, CreatedBy })

    // if (!createReturnSalesOrder) {
    //     return "failed to create return order"
    // }

    let response = { status: '', message: '' }

    for (const returnItem of ReturnItems) {

        checkSalesOrderItems.find((soItem) => {
            if (soItem.ProductID !== returnItem.ProductID) {
                response.message = `${returnItem.ProductID} doesn't exists in the sales order`
            }
        })

    }

    return {
        checkSalesOrder,
        checkSalesOrderItems,
        response
    }

}

module.exports = { createReturnSalesOrder }

/* {
    "newReturnSalesOrder": {
        "checkSalesOrder": [
            {
                "OrderID": 1,
                "CustomerID": 1,
                "OrderDate": "2025-07-06T20:31:34.000Z",
                "TotalAmount": "5865",
                "Status": "TO DELIVER",
                "Discount": "1035",
                "PaymentStatus": "PAID",
                "DiscountID": 3,
                "createdAt": "2025-07-06T15:01:36.000Z",
                "updatedAt": "2025-07-06T15:01:36.000Z",
                "LocationID": 2
            }
        ],
        "checkSalesOrderItems": [
            {
                "OrderID": 1,
                "ProductID": 1,
                "Quantity": 5,
                "UnitPrice": "1000",
                "createdAt": "2025-07-06T15:01:36.000Z",
                "updatedAt": "2025-07-06T15:01:36.000Z"
            },
            {
                "OrderID": 1,
                "ProductID": 2,
                "Quantity": 2,
                "UnitPrice": "950",
                "createdAt": "2025-07-06T15:01:36.000Z",
                "updatedAt": "2025-07-06T15:01:36.000Z"
            }
        ],
        "createReturnSalesOrder": {
            "ReturnID": 1,
            "SalesOrderID": 1,
            "ReturnDate": "2025-08-05T00:00:00.000Z",
            "Reason": "TEST",
            "CreatedBy": 1,
            "updatedAt": "2025-08-05T07:00:45.393Z",
            "createdAt": "2025-08-05T07:00:45.393Z"
        }
    }
} */