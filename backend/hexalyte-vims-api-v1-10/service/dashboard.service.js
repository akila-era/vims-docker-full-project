const db = require('../models');
const { Op } = require('sequelize');

const Customer = db.customer;
const Salesorder = db.salesorder;
const Product = db.product;
const ProductStorage = db.productstorage;

/**
 * Get comprehensive dashboard statistics
 * Returns all dashboard data in a single API call
 */
const getDashboardStats = async () => {
  try {
    // Get date ranges for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for better performance
    const [
      ordersData,
      customersData,
      productsData,
      productStorageData,
      recentOrders,
      recentCustomers
    ] = await Promise.all([
      // Orders statistics
      Salesorder.findAll({
        where: { isActive: 1 },
        attributes: [
          'OrderID',
          'OrderDate',
          'TotalAmount',
          'Status',
          'PaymentStatus'
        ]
      }),

      // Customers statistics
      Customer.findAll({
        attributes: [
          'CustomerID',
          'Name',
          'isActive',
          'createdAt'
        ]
      }),

      // Products for inventory value
      Product.findAll({
        attributes: [
          'ProductID',
          'Name',
          'SellingPrice',
          'QuantityInStock'
        ]
      }),

      // Product storage for stock details
      ProductStorage.findAll({
        attributes: [
          'ProductID',
          'Quantity'
        ]
      }),

      // Recent 10 orders
      Salesorder.findAll({
        where: { isActive: 1 },
        order: [['OrderDate', 'DESC']],
        limit: 10,
        attributes: [
          'OrderID',
          'CustomerID',
          'OrderDate',
          'TotalAmount',
          'Status',
          'PaymentStatus'
        ]
      }),

      // Recent 5 customers
      Customer.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: [
          'CustomerID',
          'Name',
          'Email',
          'Phone',
          'isActive',
          'createdAt'
        ]
      })
    ]);

    // Calculate order statistics
    const totalOrders = ordersData.length;
    const pendingOrders = ordersData.filter(o => 
      ['PENDING', 'SUBMITTED', 'NEW'].includes(o.Status?.toUpperCase())
    ).length;
    const completedOrders = ordersData.filter(o => 
      ['COMPLETED', 'DELIVERED', 'FINISHED'].includes(o.Status?.toUpperCase())
    ).length;
    const cancelledOrders = ordersData.filter(o => 
      o.Status?.toUpperCase() === 'CANCELLED'
    ).length;

    // Calculate revenue from inventory (selling price × stock)
    const totalRevenue = productsData.reduce((sum, product) => {
      return sum + (parseFloat(product.SellingPrice || 0) * parseFloat(product.QuantityInStock || 0));
    }, 0);

    // Calculate customer statistics
    const totalCustomers = customersData.length;
    const activeCustomers = customersData.filter(c => c.isActive === true || c.isActive === 1).length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    const newCustomersThisMonth = customersData.filter(c => 
      c.createdAt && new Date(c.createdAt) >= startOfMonth
    ).length;

    // Calculate inventory statistics
    const totalProducts = productsData.length;
    const lowStockProducts = productsData.filter(p => 
      parseFloat(p.QuantityInStock || 0) < 10 && parseFloat(p.QuantityInStock || 0) > 0
    );
    const outOfStockProducts = productsData.filter(p => 
      parseFloat(p.QuantityInStock || 0) === 0
    ).length;

    // Calculate last month data for change percentages
    const lastMonthOrders = ordersData.filter(o => {
      const orderDate = new Date(o.OrderDate);
      return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
    }).length;

    const lastMonthCustomers = customersData.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = new Date(c.createdAt);
      return createdDate >= startOfLastMonth && createdDate <= endOfLastMonth;
    }).length;

    // Calculate percentage changes
    const ordersChange = lastMonthOrders > 0 
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;
    const customersChange = lastMonthCustomers > 0
      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
      : 0;

    // Return comprehensive dashboard data
    return {
      revenue: {
        total: parseFloat(totalRevenue.toFixed(2)),
        change: 0, // Can be calculated if you have historical data
        inventoryValue: parseFloat(totalRevenue.toFixed(2))
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        change: parseFloat(ordersChange)
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        newThisMonth: newCustomersThisMonth,
        change: parseFloat(customersChange)
      },
      inventory: {
        totalItems: totalProducts,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts,
        change: 0 // Can be calculated if you track inventory changes
      },
      recentOrders: recentOrders.map(order => ({
        orderID: order.OrderID,
        customerID: order.CustomerID,
        orderDate: order.OrderDate,
        totalAmount: parseFloat(order.TotalAmount || 0),
        status: order.Status,
        paymentStatus: order.PaymentStatus
      })),
      recentCustomers: recentCustomers.map(customer => ({
        customerID: customer.CustomerID,
        name: customer.Name,
        email: customer.Email,
        phone: customer.Phone,
        isActive: customer.isActive,
        createdAt: customer.createdAt
      })),
      lowStockProducts: lowStockProducts.slice(0, 5).map(product => ({
        productID: product.ProductID,
        name: product.Name,
        quantityInStock: parseFloat(product.QuantityInStock || 0)
      }))
    };

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

module.exports = {
  getDashboardStats
};
