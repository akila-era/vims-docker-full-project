const db = require('../models');
const Purchaseorderdetail = db.purchaseorderdetail;
const Purchaseorder = db.purchaseorder;
const Product = db.product;
const ProductStorage = db.productstorage;
const InventoryTransaction = db.inventorytransaction;

const getPurchaseOrderDetailsByOrderID = async (orderID) => {

    const purchaseOrderDetailsByOrderID = await Purchaseorderdetail.findAll({ where: { OrderID: orderID }, include: [{ model: db.product, required: true }] })
    return purchaseOrderDetailsByOrderID

}

const addPurchaseOrderDetails = async (params) => {

    const { OrderID, ProductID, Quantity, UnitPrice, LocationID } = params;

    const checkPurchaseOrderID = await Purchaseorder.findByPk(OrderID)
    if (checkPurchaseOrderID == null) {
        return "Invalid Purchase Order ID"
    }

    const checkProductID = await Product.findByPk(ProductID)
    if (checkProductID == null) {
        return "Invalid Product ID"
    }

    const newPurchaseOrderDetail = {
        OrderID,
        ProductID,
        Quantity,
        UnitPrice
    }

    const addPurchaseOrderByOrderID = await Purchaseorderdetail.create(newPurchaseOrderDetail);

    // Update Product global stock (QuantityInStock)
    const currentQty = Number(checkProductID.QuantityInStock) || 0;
    await Product.update(
        { QuantityInStock: currentQty + Number(Quantity) },
        { where: { ProductID } }
    );

    // Update warehouse-level stock (ProductStorage) if LocationID provided
    if (LocationID) {
        const storage = await ProductStorage.findOne({ where: { ProductID, LocationID } });
        if (storage) {
            const storageQty = Number(storage.Quantity) || 0;
            await ProductStorage.update(
                { Quantity: storageQty + Number(Quantity), LastUpdated: new Date() },
                { where: { ProductID, LocationID } }
            );
        } else {
            await ProductStorage.create({
                ProductID,
                LocationID,
                Quantity: Number(Quantity),
                LastUpdated: new Date()
            });
        }

        // Create inventory transaction record
        await InventoryTransaction.create({
            PurchaseOrderID: OrderID,
            ProductID,
            Quantity: Number(Quantity),
            TransactionDate: new Date(),
            TransactionType: 'FULFILL'
        });
    }

    return addPurchaseOrderByOrderID;

}

const updatePurchaseOrderDetails = async (req, body) => {

    const OrderID = req.id
    const ProductID = req.pid

    const { Quantity, UnitPrice } = body;

    const checkPurchaseOrderID = await Purchaseorder.findByPk(OrderID)
    if (checkPurchaseOrderID == null) {
        return "Invalid Purchase Order ID"
    }

    const checkProductID = await Product.findByPk(ProductID)
    if (checkProductID == null) {
        return "Invalid Product ID"
    }

    const updatedPurchaseOrderDetail = {
        Quantity,
        UnitPrice
    }

    const updatePurchaseOrderDetail = await Purchaseorderdetail.update(updatedPurchaseOrderDetail, { where: { OrderID, ProductID } })
    return updatePurchaseOrderDetail

}

const deletePurchaseOrderDetail = async (params) => {

    const OrderID = params.id
    const ProductID = params.pid

    const checkPurchaseOrderID = await Purchaseorder.findByPk(OrderID)
    if (checkPurchaseOrderID == null) {
        return "Invalid Purchase Order ID"
    }

    const checkProductID = await Product.findByPk(ProductID)
    if (checkProductID == null) {
        return "Invalid Product ID"
    }

    const deletedPurchaseOrderDetail = await Purchaseorderdetail.destroy({ where: { OrderID, ProductID } })
    return deletedPurchaseOrderDetail

}

const deletePurchaseOrderDetailsByOrderID = async (orderID) => {

    const checkPurchaseOrderID = await Purchaseorder.findByPk(orderID)
    if (checkPurchaseOrderID == null) {
        return "Invalid Purchase Order ID"
    }

    const deletedPurchaseOrderDetails = await Purchaseorderdetail.destroy({ where: { OrderID: orderID } })
    return deletedPurchaseOrderDetails

}

module.exports = {
    getPurchaseOrderDetailsByOrderID,
    addPurchaseOrderDetails,
    updatePurchaseOrderDetails,
    deletePurchaseOrderDetail,
    deletePurchaseOrderDetailsByOrderID
}