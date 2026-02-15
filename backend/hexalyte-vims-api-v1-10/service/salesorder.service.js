const { raw } = require("body-parser");
const db = require("../models");
const {
  generateAndSaveSalesorderInvoice,
} = require("./salesorderInvoice.service");
const Salesorder = db.salesorder;
const SalesorderDetail = db.salesorderdetail
const Inventory = db.inventorytransaction
const ProductStorage = db.productstorage
const Product = db.product
const OrderStatusHistory = db.orderstatushistory

const createsalesorder = async (params) => {

  const { OrderDate, TotalAmount, Status, LocationID, Discount, CustomerID, PaymentStatus, DiscountID, TransactionType, OrderItems } = params;
  const salesorder = { OrderDate, TotalAmount, Status, LocationID, Discount, CustomerID, PaymentStatus, DiscountID , isActive: 1 };

  let response = {
    SalesOrder: "",
    Status: "",
    OrderItemsRes: [],
    InventoryTransactionRes: [],
    ProductStorageRes: [],
    ProductQuantityRes: [],
  }

  if (OrderItems.length == 0) {
    response.Status = "No Order Items Found"
    return response
  }

  let terminate = false;

  for (const soItem of OrderItems) {
    const productStorageStock = await ProductStorage.findOne({ where: { ProductID: soItem.ProductID, LocationID } })

    if (!productStorageStock || Number(productStorageStock.Quantity) < Number(soItem.Quantity)) {
      response.Status = `Not quantity available for Product #${soItem.ProductID} in Warehouse #${LocationID}`
      terminate = true
      break
    }

  }

  if (!terminate) {

    const salesOrderRow = await Salesorder.create(salesorder)
    response.SalesOrder = salesOrderRow
    const OrderID = salesOrderRow.OrderID
    console.log(`OrderID: ${OrderID}`)

    for (const soItem of OrderItems) {

      const productStorageStock = await ProductStorage.findOne({ where: { ProductID: soItem.ProductID, LocationID } })
      const productStock = await Product.findOne({ where: { ProductID: soItem.ProductID } })

      const newStock = parseFloat((Number(productStorageStock.Quantity) - Number(soItem.Quantity)).toFixed(2))
      const newProductStock = parseFloat((Number(productStock.QuantityInStock) - Number(soItem.Quantity)).toFixed(2))

      const addSalesOrderItem = await SalesorderDetail.create({ ...soItem, OrderID: OrderID })
      const addInventoryTransaction = await Inventory.create({ SalesOrderID: OrderID, ProductID: soItem.ProductID, Quantity: soItem.Quantity, TransactionDate: OrderDate, TransactionType })
      const updateProductStorage = await ProductStorage.update({ Quantity: newStock }, { where: { ProductID: soItem.ProductID, LocationID } })
      const updateProductQuantity = await Product.update({ QuantityInStock: newProductStock }, { where: { ProductID: soItem.ProductID } })

      response.OrderItemsRes.push(addSalesOrderItem)
      response.InventoryTransactionRes.push(addInventoryTransaction)
      response.ProductStorageRes.push(updateProductStorage)
      response.ProductQuantityRes.push(updateProductQuantity)

    }

    OrderStatusHistory.create({ salesorderOrderID: OrderID, StatusChangeDate: new Date(), NewStatus: Status })
    response.Status = "success"

  }

  return response

};

const getallsalesorder = async () => {
  try {
    const salesorder = await Salesorder.findAll();
    return salesorder;
  } catch (error) {
    console.log(error);
  }
};

const getsalesorderBYId = async (OrderId) => {
  const salesorder = await Salesorder.findOne({ where: { OrderId } });
  return salesorder;
};

const updatesalesorderPayementStatusById = async (OrderId, updateBody) => {
  const {
    CustomerName,
    OrderDate,
    TotalAmount,
    Status,
    LocationID,
    PaymentStatus,
  } = updateBody;
  const salesorder = {
    CustomerName,
    OrderDate,
    TotalAmount,
    Status,
    LocationID,
    PaymentStatus,
  };

  const row = await Salesorder.update(salesorder, {
    where: { OrderId: OrderId },
  });
  return row;
};

const updateSalesorderById = async (orderId, params) => {
  const { OrderDate, TotalAmount, Status, LocationID, Discount, CustomerID, DiscountID, TransactionType, OrderItems } = params;

  let response = {
    SalesOrder: "",
    Status: "",
    UpdatedOrderItems: [],
    InventoryTransactions: [],
    ProductStorageUpdates: [],
    ProductQuantityUpdates: [],
  };

  const existingOrder = await Salesorder.findByPk(orderId);
  if (!existingOrder) {
    response.Status = "Sales Order not found";
    return response;
  }

  if (OrderItems.length === 0) {
    response.Status = "No Order Items Found";
    return response;
  }

  for (const soItem of OrderItems) {
    const productStorageStock = await ProductStorage.findOne({
      where: { ProductID: soItem.ProductID, LocationID }
    });

    if (!productStorageStock || Number(productStorageStock.Quantity) < Number(soItem.Quantity)) {
      response.Status = `Not enough quantity available for Product #${soItem.ProductID} in Warehouse #${LocationID}`;
      return response;
    }
  }

  const transaction = await db.sequelize.transaction();
  try {
    const oldOrderItems = await SalesorderDetail.findAll({
      where: { OrderID: orderId },
      transaction
    });

    for (const oldItem of oldOrderItems) {
      await ProductStorage.increment('Quantity', {
        by: oldItem.Quantity,
        where: { ProductID: oldItem.ProductID, LocationID: existingOrder.LocationID },
        transaction
      });

      await Product.increment('QuantityInStock', {
        by: oldItem.Quantity,
        where: { ProductID: oldItem.ProductID },
        transaction
      });
    }

    await SalesorderDetail.destroy({
      where: { OrderID: orderId },
      transaction
    });

    await Inventory.destroy({
      where: { SalesOrderID: orderId },
      transaction
    });

    await Salesorder.update(
      { OrderDate, TotalAmount, Status, LocationID, Discount, CustomerID, DiscountID },
      { where: { OrderID: orderId }, transaction }
    );

    for (const soItem of OrderItems) {
      const orderItem = await SalesorderDetail.create({
        ...soItem,
        OrderID: orderId
      }, { transaction });

      const inventoryTransaction = await Inventory.create({
        SalesOrderID: orderId,
        ProductID: soItem.ProductID,
        Quantity: soItem.Quantity,
        TransactionDate: OrderDate,
        TransactionType
      }, { transaction });

      await ProductStorage.decrement('Quantity', {
        by: soItem.Quantity,
        where: { ProductID: soItem.ProductID, LocationID },
        transaction
      });

      await Product.decrement('QuantityInStock', {
        by: soItem.Quantity,
        where: { ProductID: soItem.ProductID },
        transaction
      });

      response.UpdatedOrderItems.push(orderItem);
      response.InventoryTransactions.push(inventoryTransaction);
    }

    if (Status !== existingOrder.Status) {
      await OrderStatusHistory.create({
        salesorderOrderID: orderId,
        StatusChangeDate: new Date(),
        NewStatus: Status
      }, { transaction });
    }

    await transaction.commit();

    const updatedOrder = await Salesorder.findByPk(orderId);
    response.SalesOrder = updatedOrder;
    response.Status = "success";

    return response;
  } catch (error) {
    await transaction.rollback();
    response.Status = `Update failed: ${error.message}`;
    return response;
  }
};





// const deletesalesorderById = async (OrderId) => {


//   return await Salesorder.update({isActive: 0}, { where: { OrderID: OrderId } })
  
// };

const deletesalesorderById = async (orderId) => {
  let response = {
    Status: "",
    RestoredQuantities: []
  };

  const transaction = await db.sequelize.transaction();
  try {
    const existingOrder = await Salesorder.findByPk(orderId, { transaction });
    if (!existingOrder) {
      response.Status = "Sales Order not found";
      return response;
    }

    const orderItems = await SalesorderDetail.findAll({
      where: { OrderID: orderId },
      transaction
    });

    for (const item of orderItems) {
      await ProductStorage.increment('Quantity', {
        by: item.Quantity,
        where: { 
          ProductID: item.ProductID, 
          LocationID: existingOrder.LocationID 
        },
        transaction
      });

      await Product.increment('QuantityInStock', {
        by: item.Quantity,
        where: { ProductID: item.ProductID },
        transaction
      });

      response.RestoredQuantities.push({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        LocationID: existingOrder.LocationID
      });
    }

    // Mark order as inactive
    await Salesorder.update(
      { isActive: 0 },
      { where: { OrderID: orderId }, transaction }
    );

    await transaction.commit();
    response.Status = "success";
    return response;
  } catch (error) {
    await transaction.rollback();
    response.Status = `Delete failed: ${error.message}`;
    return response;
  }
};

const getSalesReport = async ({ startDate, endDate }) => {
  try {
    const results = await db.sequelize.query(
      `
          SELECT 
            Name AS ProductName,
            SUM(Quantity) AS UnitsSold,
            SUM(ProductSales) AS TotalSales,
            SUM(Quantity * BuyingPrice) AS COGS,
            (SUM(ProductSales) - 
            SUM(Quantity * BuyingPrice)) AS Profit
        FROM (
            SELECT 
                sod.OrderID,
                sod.ProductId,
                sod.Quantity,
                sod.UnitPrice,
                p.Name,
                p.BuyingPrice,
                (sod.Quantity * sod.UnitPrice) AS ProductSales
            FROM salesorderdetails sod
            JOIN products p ON sod.ProductId = p.ProductId
            JOIN salesorders so ON sod.OrderID = so.OrderID
            WHERE so.OrderDate BETWEEN :startDate AND :endDate
        ) AS OrderTotals
        GROUP BY Name;
        `,
      {
        replacements: { startDate, endDate },
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    const discounts = await db.sequelize.query(`
        SELECT SUM(Discount) AS TotalDiscount FROM salesorders WHERE OrderDate BETWEEN :startDate AND :endDate
      `, {
      replacements: { startDate, endDate },
      type: db.sequelize.QueryTypes.SELECT
    })

    // Get order-level data with customer names
    const orders = await db.sequelize.query(
      `
        SELECT 
          so.OrderID,
          so.OrderDate,
          so.TotalAmount,
          so.Status,
          so.PaymentStatus,
          so.Discount,
          c.Name AS CustomerName,
          c.Phone AS PhoneNumber,
          COUNT(DISTINCT sod.ProductID) AS ProductCount,
          SUM(sod.Quantity) AS TotalItems
        FROM salesorders so
        LEFT JOIN customers c ON so.CustomerID = c.CustomerID
        LEFT JOIN salesorderdetails sod ON so.OrderID = sod.OrderID
        WHERE so.OrderDate BETWEEN :startDate AND :endDate
        GROUP BY so.OrderID, so.OrderDate, so.TotalAmount, so.Status, 
                 so.PaymentStatus, so.Discount, c.Name, c.Phone
        ORDER BY so.OrderDate DESC
      `,
      {
        replacements: { startDate, endDate },
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    return { results, discounts, orders };
  } catch (error) {
    console.error('Sales Report Error:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

const getPaymentStatusSummary = async () => {
  try {
    const query = `
    SELECT
      SUM(CASE WHEN PaymentStatus = 'PAID' THEN TotalAmount ELSE 0 END) AS TotalPaidAmount,
      SUM(CASE WHEN PaymentStatus = 'UNPAID' THEN TotalAmount ELSE 0 END) AS TotalUnpaidAmount,
      SUM(TotalAmount) AS TotalAmount
    FROM salesorders
    WHERE isActive = 1;
    `;

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    return {
      success: true,
      data: results[0],
      message: "Payment status summary fetch successfully",
    };
  } catch (error) {
    console.error("Error fetching payment status summary:", error);
    return {
      success: false,
      data: {},
      message: "Failed to fetch payment status summary: " + error.message
    };
  }
};

/**
 * Get Monthly Sales Trends
 * Returns: Monthly totals for trend analysis
 */
const getMonthlySalesTrends = async (year) => {
  const results = await db.sequelize.query(
    `
    SELECT 
      MONTH(OrderDate) AS Month,
      YEAR(OrderDate) AS Year,
      COUNT(*) AS OrderCount,
      SUM(TotalAmount) AS TotalSales,
      SUM(Discount) AS TotalDiscounts,
      SUM(CASE WHEN PaymentStatus = 'PAID' THEN TotalAmount ELSE 0 END) AS PaidAmount,
      SUM(CASE WHEN PaymentStatus = 'UNPAID' THEN TotalAmount ELSE 0 END) AS UnpaidAmount
    FROM salesorders
    WHERE YEAR(OrderDate) = :year AND isActive = 1
    GROUP BY YEAR(OrderDate), MONTH(OrderDate)
    ORDER BY Month ASC
    `,
    {
      replacements: { year },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  return results;
};

/**
 * Get Sales by Customer Report
 * Returns: Sales grouped by customer
 */
const getSalesByCustomerReport = async ({ startDate, endDate }) => {
  const results = await db.sequelize.query(
    `
    SELECT 
      c.CustomerID,
      c.CustomerName,
      c.PhoneNumber,
      COUNT(so.OrderID) AS OrderCount,
      SUM(so.TotalAmount) AS TotalSpent,
      SUM(so.Discount) AS TotalDiscounts,
      MAX(so.OrderDate) AS LastOrderDate
    FROM salesorders so
    JOIN customers c ON so.CustomerID = c.CustomerID
    WHERE so.OrderDate BETWEEN :startDate AND :endDate AND so.isActive = 1
    GROUP BY c.CustomerID, c.CustomerName, c.PhoneNumber
    ORDER BY TotalSpent DESC
    `,
    {
      replacements: { startDate, endDate },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  return results;
};

module.exports = {
  getPaymentStatusSummary,
  createsalesorder,
  getallsalesorder,
  getsalesorderBYId,
  updateSalesorderById,
  deletesalesorderById,
  getSalesReport,
  updatesalesorderPayementStatusById,
  // Additional report functions
  getMonthlySalesTrends,
  getSalesByCustomerReport
};
