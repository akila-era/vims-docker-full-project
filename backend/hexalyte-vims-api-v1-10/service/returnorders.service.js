const db = require('../models')
const SalesOrders = db.salesorder
const SalesOrderDetails = db.salesorderdetail
const ReturnOrders = db.returnorders
const ReturnOrderItems = db.returnorderitems
const InventoryTransaction = db.inventorytransaction
const ProductStorage = db.productstorage
const Product = db.product
const User = db.user

// const createReturnSalesOrder = async (params) => {

//     const { SalesOrderID, ReturnDate, Reason, CreatedBy, ReturnItems } = params

//     const checkUser = await User.findAll({ where: { id: CreatedBy } })

//     if (checkUser == null || checkUser.length == 0) {
//         return "no user with matching id found"
//     }

//     const checkSalesOrder = await SalesOrders.findAll({ where: { OrderID: SalesOrderID } })

//     if (checkSalesOrder == null || checkSalesOrder.length == 0) {
//         return "no sales orders found"
//     }

//     const checkSalesOrderItems = await SalesOrderDetails.findAll({ where: { OrderID: SalesOrderID } })

//     if (checkSalesOrderItems == null || checkSalesOrderItems.length == 0) {
//         return "no sales order items"
//     }

//     let proceed = true
//     let response = { status: '', message: '' }

//     for (const returnItem of ReturnItems) {

//         const salesOrderItem = await SalesOrderDetails.findOne({ where: { ProductID: returnItem.ProductID } })

//         if (salesOrderItem == null) {
//             response.message = `No product with ${returnItem.ProductID} ID found in the sales order`
//             proceed = false
//             break
//         }

//         if (parseInt(salesOrderItem.Quantity) < parseInt(returnItem.Quantity)) {
//             response.message = `No available quantity of product ${returnItem.ProductID}`
//             proceed = false
//             break
//         }

//     }

//     const checkExistingReturns = await ReturnOrders.findAll({ where: { SalesOrderID } })

//     if (checkExistingReturns !== null || checkExistingReturns.length !== 0) {

//         for (const existingReturn of checkExistingReturns) {



//         }

//     }


//     return {
//         checkSalesOrder,
//         checkSalesOrderItems,
//         response
//     }

// }

// const createReturnSalesOrder = async (params) => {
//     const { SalesOrderID, ReturnDate, Reason, CreatedBy, ReturnItems } = params;

//     try {
//         // Check if user exists
//         const checkUser = await User.findByPk(CreatedBy);
//         if (!checkUser) {
//             return {
//                 status: 'error',
//                 message: 'No user with matching ID found'
//             };
//         }

//         // Check if sales order exists
//         const salesOrder = await SalesOrders.findOne({ where: { OrderID: SalesOrderID } });
//         if (!salesOrder) {
//             return {
//                 status: 'error',
//                 message: 'No sales order found'
//             };
//         }

//         // Get all sales order items
//         const salesOrderItems = await SalesOrderDetails.findAll({
//             where: { OrderID: SalesOrderID }
//         });
//         if (!salesOrderItems || salesOrderItems.length === 0) {
//             return {
//                 status: 'error',
//                 message: 'No sales order items found'
//             };
//         }

//         // Get existing returns for this sales order
//         const existingReturns = await ReturnOrders.findAll({
//             where: { SalesOrderID },
//             include: [{
//                 model: ReturnOrderItems
//             }]
//         });

//         // Calculate already returned quantities
//         const returnedQuantities = {};
//         if (existingReturns && existingReturns.length > 0) {
//             for (const returnOrder of existingReturns) {
//                 if (returnOrder.returnItems) {
//                     for (const returnItem of returnOrder.returnorderitems) {
//                         const productId = returnItem.ProductID;
//                         returnedQuantities[productId] = (returnedQuantities[productId] || 0) + parseInt(returnItem.Quantity);
//                     }
//                 }
//             }
//         }

//         // Validate return items
//         for (const returnItem of ReturnItems) {
//             const salesOrderItem = salesOrderItems.find(item =>
//                 item.ProductID === returnItem.ProductID
//             );

//             if (!salesOrderItem) {
//                 return {
//                     status: 'error',
//                     message: `Product with ID ${returnItem.ProductID} not found in the sales order`
//                 };
//             }

//             const originalQuantity = parseInt(salesOrderItem.Quantity);
//             const alreadyReturned = returnedQuantities[returnItem.ProductID] || 0;
//             const availableForReturn = originalQuantity - alreadyReturned;
//             const requestedQuantity = parseInt(returnItem.Quantity);

//             if (requestedQuantity > availableForReturn) {
//                 return {
//                     status: 'error',
//                     message: `Insufficient quantity for product ${returnItem.ProductID}. Available for return: ${availableForReturn}, requested: ${requestedQuantity}`
//                 };
//             }

//             if (requestedQuantity <= 0) {
//                 return {
//                     status: 'error',
//                     message: `Invalid quantity for product ${returnItem.ProductID}. Quantity must be greater than 0`
//                 };
//             }
//         }

//         // Create the return order
//         const transaction = await db.sequelize.transaction(); // Assuming you're using Sequelize transactions

//         try {
//             // Generate return order ID (adjust logic as needed)
//             // const returnOrderId = `RET-${Date.now()}`;

//             // Create return order
//             const returnOrder = await ReturnOrders.create({
//                 // ReturnOrderID: returnOrderId,
//                 SalesOrderID,
//                 ReturnDate: ReturnDate || new Date(),
//                 Reason,
//                 CreatedBy,
//                 // Status: 'Pending', // Adjust default status as needed
//                 CreatedAt: new Date(),
//                 UpdatedAt: new Date()
//             }, { transaction });

//             // Create return order details
//             const returnOrderDetails = [];
//             for (const returnItem of ReturnItems) {
//                 const salesOrderItem = salesOrderItems.find(item =>
//                     item.ProductID === returnItem.ProductID
//                 );

//                 const returnOrderDetail = await ReturnOrderItems.create({
//                     ReturnID: returnOrder.ReturnID,
//                     ProductID: returnItem.ProductID,
//                     Quantity: returnItem.Quantity,
//                     // UnitPrice: salesOrderItem.UnitPrice, // Use original price
//                     // TotalAmount: parseFloat(salesOrderItem.UnitPrice) * parseInt(returnItem.Quantity),
//                     // Reason: returnItem.Reason || '', // Item-specific reason or general reason
//                     CreatedAt: new Date(),
//                     UpdatedAt: new Date()
//                 }, { transaction });

//                 returnOrderDetails.push(returnOrderDetail);
//             }

//             // Commit transaction
//             await transaction.commit();

//             return {
//                 status: 'success',
//                 message: 'Return order created successfully',
//                 data: {
//                     returnOrder,
//                     returnOrderDetails
//                 }
//             };

//         } catch (error) {
//             // Rollback transaction on error
//             await transaction.rollback();
//             throw error;
//         }

//     } catch (error) {
//         console.error('Error creating return sales order:', error);
//         return {
//             status: 'error',
//             message: 'An error occurred while creating the return order',
//             error: error.message
//         };
//     }
// };

const getAllReturnOrders = async () => {

    const allReturnOrders = await ReturnOrders.findAll({
        include: [{
            model: ReturnOrderItems,
            include: [{
                model: Product
            }]
        }]
    });

    if (allReturnOrders == null || allReturnOrders.length == 0) return `no return orders found`

    return allReturnOrders

}

const createReturnSalesOrder = async (params) => {
    const { SalesOrderID, ReturnDate, Reason, CreatedBy, ReturnItems } = params;

    try {
        // Check if user exists
        const checkUser = await User.findByPk(CreatedBy);
        if (!checkUser) {
            return {
                status: 'error',
                message: 'No user with matching ID found'
            };
        }

        // Check if sales order exists
        const salesOrder = await SalesOrders.findOne({ where: { OrderID: SalesOrderID } });
        if (!salesOrder) {
            return {
                status: 'error',
                message: 'No sales order found'
            };
        }

        // Get all sales order items
        const salesOrderItems = await SalesOrderDetails.findAll({
            where: { OrderID: SalesOrderID }
        });
        if (!salesOrderItems || salesOrderItems.length === 0) {
            return {
                status: 'error',
                message: 'No sales order items found'
            };
        }

        // Get existing returns for this sales order
        const existingReturns = await ReturnOrders.findAll({
            where: { SalesOrderID },
            include: [{
                model: ReturnOrderItems
            }]
        });

        // Calculate already returned quantities
        const returnedQuantities = {};
        if (existingReturns && existingReturns.length > 0) {
            for (const returnOrder of existingReturns) {
                if (returnOrder.returnorderitems) {
                    for (const returnItem of returnOrder.returnorderitems) {
                        const productId = returnItem.ProductID;
                        returnedQuantities[productId] = (returnedQuantities[productId] || 0) + parseInt(returnItem.Quantity);
                    }
                }
            }
        }

        // Validate return items
        for (const returnItem of ReturnItems) {
            const salesOrderItem = salesOrderItems.find(item =>
                item.ProductID === returnItem.ProductID
            );

            if (!salesOrderItem) {
                return {
                    status: 'error',
                    message: `Product with ID ${returnItem.ProductID} not found in the sales order`
                };
            }

            const originalQuantity = parseInt(salesOrderItem.Quantity);
            const alreadyReturned = returnedQuantities[returnItem.ProductID] || 0;
            const availableForReturn = originalQuantity - alreadyReturned;
            const requestedQuantity = parseInt(returnItem.Quantity);

            if (requestedQuantity > availableForReturn) {
                return {
                    status: 'error',
                    message: `Insufficient quantity for product ${returnItem.ProductID}. Available for return: ${availableForReturn}, requested: ${requestedQuantity}`
                };
            }

            if (requestedQuantity <= 0) {
                return {
                    status: 'error',
                    message: `Invalid quantity for product ${returnItem.ProductID}. Quantity must be greater than 0`
                };
            }
        }

        // Create the return order
        const transaction = await db.sequelize.transaction();

        try {
            // Create return order
            const returnOrder = await ReturnOrders.create({
                SalesOrderID,
                ReturnDate: ReturnDate || new Date(),
                Reason,
                CreatedBy,
                CreatedAt: new Date(),
                UpdatedAt: new Date()
            }, { transaction });

            // Create return order details
            const returnOrderDetails = [];
            const inventoryTransactionDetails = []
            const productStorageDetails = []
            const productQuantityDetails = []
            for (const returnItem of ReturnItems) {
                const salesOrderItem = salesOrderItems.find(item =>
                    item.ProductID === returnItem.ProductID
                );

                const returnOrderDetail = await ReturnOrderItems.create({
                    ReturnID: returnOrder.ReturnID,
                    ProductID: returnItem.ProductID,
                    Quantity: returnItem.Quantity,
                    Note: returnItem.Note || '',
                    CreatedAt: new Date(),
                    UpdatedAt: new Date()
                }, { transaction });

                returnOrderDetails.push(returnOrderDetail);

                const inventoryTransactionDetail = await InventoryTransaction.create({
                    SalesOrderID,
                    ProductID: returnItem.ProductID,
                    Quantity: returnItem.Quantity,
                    TransactionDate: ReturnDate,
                    TransactionType: 'RETURN'
                }, { transaction })

                inventoryTransactionDetails.push(inventoryTransactionDetail)

                const productStorageUpdate = await ProductStorage.increment('Quantity', {
                    by: returnItem.Quantity,
                    where: { ProductID: returnItem.ProductID, LocationID: salesOrder.LocationID },
                    transaction
                })

                productStorageDetails.push(productStorageUpdate)

                const productQuantityUpdate = await Product.increment('QuantityInStock', {
                    by: returnItem.Quantity,
                    where: { ProductID: returnItem.ProductID },
                    transaction
                })

                productQuantityDetails.push(productQuantityUpdate)

            }

            // Commit transaction
            await transaction.commit();

            return {
                status: 'success',
                message: 'Return order created successfully',
                data: {
                    returnOrder,
                    returnOrderDetails,
                    inventoryTransactionDetails,
                    productStorageDetails,
                    productQuantityDetails
                }
            };

        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error creating return sales order:', error);
        return {
            status: 'error',
            message: 'An error occurred while creating the return order',
            error: error.message
        };
    }
};

// Helper function to get return summary for a sales order
const getReturnSummary = async (salesOrderId) => {
    try {
        const returns = await ReturnOrders.findAll({
            where: { SalesOrderID: salesOrderId },
            include: [{
                model: ReturnOrderItems
            }]
        });

        const summary = {};
        for (const returnOrder of returns) {
            if (returnOrder.returnorderitems) {
                for (const item of returnOrder.returnorderitems) {
                    const productId = item.ProductID;
                    if (!summary[productId]) {
                        summary[productId] = {
                            totalReturned: 0,
                            returns: []
                        };
                    }
                    summary[productId].totalReturned += parseInt(item.Quantity);
                    summary[productId].returns.push({
                        returnId: returnOrder.ReturnID,
                        quantity: item.Quantity,
                        date: returnOrder.ReturnDate,
                        reason: returnOrder.Reason,
                        note: item.Note
                    });
                }
            }
        }

        return summary;
    } catch (error) {
        console.error('Error getting return summary:', error);
        return {};
    }
};

module.exports = { createReturnSalesOrder, getAllReturnOrders }

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