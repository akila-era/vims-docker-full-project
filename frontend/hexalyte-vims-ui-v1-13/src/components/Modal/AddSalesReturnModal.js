import React, { useState } from 'react';
import { X, Plus, Trash2, Package, Calendar, User, FileText, AlertCircle, Search } from 'lucide-react';

const AddSalesReturnModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    SalesOrderID: '',
    ReturnDate: new Date().toISOString().split('T')[0],
    Reason: '',
    CreatedBy: 1 // You might want to get this from user context
  });

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

  const products = [
    { id: 1, name: 'Product A', price: 50.00, sku: 'SKU-001' },
    { id: 2, name: 'Product B', price: 30.00, sku: 'SKU-002' },
    { id: 3, name: 'Product C', price: 75.00, sku: 'SKU-003' },
    { id: 4, name: 'Product D', price: 120.00, sku: 'SKU-004' }
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sales Order */}
                <div>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.SalesOrderID ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Sales Order</option>
                    {salesOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customerName}
                      </option>
                    ))}
                  </select>
                  {errors.SalesOrderID && (
                    <p className="mt-1 text-sm text-red-600">{errors.SalesOrderID}</p>
                  )}
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ReturnDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.ReturnDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.ReturnDate}</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return *
                </label>
                <select
                  value={formData.Reason}
                  onChange={(e) => {
                    setFormData({ ...formData, Reason: e.target.value });
                    const newErrors = { ...errors };
                    delete newErrors.Reason;
                    setErrors(newErrors);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.Reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select reason</option>
                  {reasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                {errors.Reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.Reason}</p>
                )}
              </div>
            </div>

            {/* Return Items */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Return Items</h4>
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

              <div className="space-y-3">
                {returnItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Product */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <select
                          value={item.ProductID}
                          onChange={(e) => updateReturnItem(index, 'ProductID', e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`item_${index}_product`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}_product`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_product`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.Quantity}
                          onChange={(e) => updateReturnItem(index, 'Quantity', e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      {/* Note */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Note
                        </label>
                        <input
                          type="text"
                          placeholder="Optional note about this item..."
                          value={item.Note}
                          onChange={(e) => updateReturnItem(index, 'Note', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    {returnItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReturnItem(index)}
                        className="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
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
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="ml-2 font-medium">
                    {returnItems.reduce((sum, item) => sum + (parseInt(item.Quantity) || 0), 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Value:</span>
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