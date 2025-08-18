import { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus, Trash2, Package, Calendar, User, FileText, AlertCircle, Search } from 'lucide-react';
import { createAxiosInstance } from 'api/axiosInstance';
import { motion } from "framer-motion";
import Select from 'react-select';

const AddSalesReturnModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        SalesOrderID: '',
        ReturnDate: new Date().toISOString().split('T')[0],
        Reason: '',
        CreatedBy: 1 // You might want to get this from user context
    });

    const [selectedSalesOrderId, setSelectedSalesOrderId] = useState([]);

    console.log(selectedSalesOrderId)
    // load Detailss
    const [salesOrders1, setselesOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    

    useEffect(() => {
        const fetchData = async () => {
            const api = createAxiosInstance();
            const [productRes, warehouseRes, customerRes, SalesOrderRes] = await Promise.all([
                api.get("product"),
                api.get("location"),
                api.get("customer"),
                api.get("salesorder"),
            ]);
            setProducts(productRes.data.allProducts.filter(p => p.isActive));
            setWarehouses(warehouseRes.data.locations);
            setCustomers(customerRes.data.allCustomers);
            setselesOrders(SalesOrderRes.data.salesorders);
        };

        fetchData();
    }, []);

    console.log(salesOrders1);

    const [returnItems, setReturnItems] = useState([
        { ProductID: '', Quantity: 1, Note: '' }
    ]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock data - replace with actual API calls
    const salesOrders = [
        { id: 1, orderNumber: 'SO-001', customerName: 'John Doe' },
        { id: 2, orderNumber: 'SO-002', customerName: 'Jane Smith' },
        { id: 3, orderNumber: 'SO-003', customerName: 'Bob Johnson' }
    ];

    // const products = [
    //     { id: 1, name: 'Product A', price: 50.00, sku: 'SKU-001' },
    //     { id: 2, name: 'Product B', price: 30.00, sku: 'SKU-002' },
    //     { id: 3, name: 'Product C', price: 75.00, sku: 'SKU-003' },
    //     { id: 4, name: 'Product D', price: 120.00, sku: 'SKU-004' }
    // ];
    const salesOrderOptions = useMemo(() => {
        return salesOrders1.map((order) => {
            const customer = customers.find(c => c.CustomerID === order.CustomerID);
            const location = warehouses.find(c => c.LocationID === order.LocationID);
            return {
                value: order.OrderID,
                label: `#${order.OrderID} Customer - ${customer ? customer.Name : "Unknown"} Location - ${location?.WarehouseName || "Unknown"}`
            };
        });
    }, [salesOrders1, customers, warehouses]);
    const salesItems = [
        {
            ProductID: 1,
            ProductName: "Whey Protein 2kg",
            Quantity: 2,
            UnitPrice: 15000,
            TotalPrice: 30000
        },
        {
            ProductID: 2,
            ProductName: "Resistance Band Set",
            Quantity: 1,
            UnitPrice: 7500,
            TotalPrice: 7500
        },
        {
            ProductID: 3,
            ProductName: "Creatine Monohydrate 300g",
            Quantity: 3,
            UnitPrice: 5500,
            TotalPrice: 16500
        }
    ];

    const reasons = [
        'Defective item',
        'Wrong size',
        'Wrong color',
        'Not as described',
        'Damaged during shipping',
        'Customer changed mind',
        'Quality issues',
        'Other'
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.SalesOrderID) {
            newErrors.SalesOrderID = 'Sales Order is required';
        }

        if (!formData.ReturnDate) {
            newErrors.ReturnDate = 'Return date is required';
        }

        if (!formData.Reason.trim()) {
            newErrors.Reason = 'Reason is required';
        }

        // Validate return items
        returnItems.forEach((item, index) => {
            if (!item.ProductID) {
                newErrors[`item_${index}_product`] = 'Product is required';
            }
            if (!item.Quantity || item.Quantity < 1) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
            }
        });

        // Check for duplicate products
        const productIds = returnItems.map(item => item.ProductID).filter(Boolean);
        const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            newErrors.duplicateProducts = 'Cannot have duplicate products';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const submitData = {
            ...formData,
            SalesOrderID: parseInt(formData.SalesOrderID),
            returnorderitems: returnItems
                .filter(item => item.ProductID && item.Quantity)
                .map(item => ({
                    ProductID: parseInt(item.ProductID),
                    Quantity: parseInt(item.Quantity),
                    Note: item.Note.trim()
                }))
        };

        try {
            await onSubmit(submitData);
            handleClose();
        } catch (error) {
            console.error('Error submitting return:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            SalesOrderID: '',
            ReturnDate: new Date().toISOString().split('T')[0],
            Reason: '',
            CreatedBy: 1
        });
        setReturnItems([{ ProductID: '', Quantity: 1, Note: '' }]);
        setErrors({});
        setIsSubmitting(false);
        onClose();
    };

    const addReturnItem = () => {
        setReturnItems([...returnItems, { ProductID: '', Quantity: 1, Note: '' }]);
    };

    const removeReturnItem = (index) => {
        if (returnItems.length > 1) {
            const newItems = returnItems.filter((_, i) => i !== index);
            setReturnItems(newItems);
        }
    };

    const updateReturnItem = (index, field, value) => {
        const newItems = [...returnItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setReturnItems(newItems);

        // Clear related errors
        const newErrors = { ...errors };
        delete newErrors[`item_${index}_${field.toLowerCase()}`];
        if (field === 'ProductID') {
            delete newErrors.duplicateProducts;
        }
        setErrors(newErrors);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Add Sales Return</h3>
                                <p className="text-sm text-gray-500">Create a new return order for sold items</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-4">
                        {/* Basic Information */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <h4 className="font-medium text-gray-900">Return Information</h4>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Sales Order */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sales Order *
                                    </label>
                                    <select
                                        value={formData.SalesOrderID}
                                        onChange={(e) => {
                                            setFormData({ ...formData, SalesOrderID: e.target.value });
                                            const newErrors = { ...errors };
                                            delete newErrors.SalesOrderID;
                                            setErrors(newErrors);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.SalesOrderID ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Sales Order</option>
                                        {salesOrders1.map((order) => {
                                            // find customer by ID
                                            const customer = customers.find(c => c.CustomerID === order.CustomerID);
                                            const location = warehouses.find(c => c.LocationID === order.LocationID);
                                            return (
                                                <option key={order.OrderID} value={order.OrderID}>
                                                    #{order.OrderID} Customer - {customer ? customer.Name : "Unknown"} Location - {location.WarehouseName}
                                                </option>
                                            );
                                        })}
                                    </select>

                                    {errors.SalesOrderID && (
                                        <p className="mt-1 text-sm text-red-600">{errors.SalesOrderID}</p>
                                    )}
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sales Order *
                                    </label>
                                    <Select
                                        options={salesOrderOptions}
                                        value={salesOrderOptions.find(option => option.value === formData.SalesOrderID)}
                                        onChange={(selectedOption) => {
                                            const selectedId = selectedOption?.value || '';
                                            setFormData({ ...formData, SalesOrderID: selectedId });
                                            setSelectedSalesOrderId(selectedId); // Set the selected ID here

                                            const newErrors = { ...errors };
                                            delete newErrors.SalesOrderID;
                                            setErrors(newErrors);

                                            // If you need the full order data:
                                            // const selectedOrder = salesOrders1.find(order => order.OrderID === selectedId);
                                            // Do something with selectedOrder...
                                        }}
                                        className={`w-full ${errors.SalesOrderID ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Select Sales Order"
                                        isSearchable
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '42px',
                                                borderColor: errors.SalesOrderID ? '#fca5a5' : '#d1d5db',
                                                '&:hover': {
                                                    borderColor: errors.SalesOrderID ? '#fca5a5' : '#d1d5db'
                                                }
                                            })
                                        }}
                                    />
                                    {errors.SalesOrderID && (
                                        <p className="mt-1 text-sm text-red-600">{errors.SalesOrderID}</p>
                                    )}
                                </div>

                                {/* Return Date */}
                                {/* <div> */}
                                {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.ReturnDate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, ReturnDate: e.target.value });
                                            const newErrors = { ...errors };
                                            delete newErrors.ReturnDate;
                                            setErrors(newErrors);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.ReturnDate ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.ReturnDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.ReturnDate}</p>
                                    )}
                                </div> */}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Return *
                                </label>
                                {/* Note */}
                                <div className="md:col-span-2">

                                    <input
                                        type="text"
                                        placeholder="Optional note about this item..."
                                        // value={item.Note}
                                        // onChange={(e) => updateReturnItem(index, 'Note', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Return Items */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-600" />
                                    <h4 className="font-medium text-gray-900">Order Items</h4>
                                </div>
                                {/* <button
                                    type="button"
                                    onClick={addReturnItem}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </button> */}
                            </div>

                            {errors.duplicateProducts && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <p className="text-sm text-red-600">{errors.duplicateProducts}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                {/* <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Order Items
                                </h4> */}
                                <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {salesItems.length > 0 ? (
                                                salesItems.map((unit, index) => (
                                                    <motion.tr
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.ProductID}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.ProductName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.Quantity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.UnitPrice.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.TotalPrice.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                            <button
                                                                // onClick={() => deleteSalesItem(unit.ProductID)}
                                                                className="text-red-600 hover:text-red-900 transition duration-200"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No items added yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        {/* Exchange Items */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-600" />
                                    <h4 className="font-medium text-gray-900">Exchange Items</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={addReturnItem}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </button>
                            </div>

                            {errors.duplicateProducts && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <p className="text-sm text-red-600">{errors.duplicateProducts}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                {/* <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Order Items
                                </h4> */}
                                <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {salesItems.length > 0 ? (
                                                salesItems.map((unit, index) => (
                                                    <motion.tr
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.ProductID}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.ProductName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.Quantity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.UnitPrice.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{unit.TotalPrice.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                            <button
                                                                // onClick={() => deleteSalesItem(unit.ProductID)}
                                                                className="text-red-600 hover:text-red-900 transition duration-200"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No items added yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h5 className="font-medium text-gray-900 mb-2">Return Summary</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Total Items:</span>
                                    <span className="ml-2 font-medium">{returnItems.filter(item => item.ProductID).length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Credit Balance</span>
                                    <span className="ml-2 font-medium">
                                        {returnItems.reduce((sum, item) => sum + (parseInt(item.Quantity) || 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Payable Amount</span>
                                    <span className="ml-2 font-medium">
                                        ${returnItems.reduce((sum, item) => {
                                            const product = products.find(p => p.id == item.ProductID);
                                            return sum + (product ? product.price * (parseInt(item.Quantity) || 0) : 0);
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? 'Creating...' : 'Create Return'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSalesReturnModal;