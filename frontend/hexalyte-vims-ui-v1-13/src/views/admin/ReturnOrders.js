import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download, Filter, Calendar, Package, ArrowLeft, ArrowRight } from 'lucide-react';

const ReturnsOrderUI = () => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Sample data for returns
  const purchaseReturns = [
    {
      id: 'PR001',
      returnNumber: 'RET-PUR-2025-001',
      originalOrder: 'PO-2025-156',
      supplier: 'ABC Electronics Ltd',
      returnDate: '2025-01-15',
      totalAmount: 1250.00,
      status: 'approved',
      reason: 'Defective items',
      items: [
        { name: 'Wireless Mouse', quantity: 5, unitPrice: 25.00, reason: 'Manufacturing defect' },
        { name: 'USB Cable', quantity: 10, unitPrice: 12.50, reason: 'Wrong specification' }
      ]
    },
    {
      id: 'PR002',
      returnNumber: 'RET-PUR-2025-002',
      originalOrder: 'PO-2025-143',
      supplier: 'Tech Solutions Inc',
      returnDate: '2025-01-20',
      totalAmount: 850.00,
      status: 'pending',
      reason: 'Excess inventory',
      items: [
        { name: 'Keyboard', quantity: 3, unitPrice: 75.00, reason: 'Over-ordered' },
        { name: 'Monitor Stand', quantity: 5, unitPrice: 35.00, reason: 'Not required' }
      ]
    }
  ];

  const salesReturns = [
    {
      id: 'SR001',
      returnNumber: 'RET-SAL-2025-001',
      originalOrder: 'SO-2025-089',
      customer: 'Johnson & Associates',
      returnDate: '2025-01-18',
      totalAmount: 980.00,
      status: 'processing',
      reason: 'Customer dissatisfaction',
      items: [
        { name: 'Office Chair', quantity: 2, unitPrice: 150.00, reason: 'Color mismatch' },
        { name: 'Desk Lamp', quantity: 4, unitPrice: 45.00, reason: 'Damaged in transit' }
      ]
    },
    {
      id: 'SR002',
      returnNumber: 'RET-SAL-2025-002',
      originalOrder: 'SO-2025-067',
      customer: 'Global Marketing Corp',
      returnDate: '2025-01-22',
      totalAmount: 2100.00,
      status: 'completed',
      reason: 'Warranty claim',
      items: [
        { name: 'Laptop Stand', quantity: 6, unitPrice: 85.00, reason: 'Hardware failure' },
        { name: 'Wireless Headset', quantity: 8, unitPrice: 120.00, reason: 'Audio issues' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const currentReturns = activeTab === 'purchase' ? purchaseReturns : salesReturns;

  const filteredReturns = currentReturns.filter(item => {
    const matchesSearch = item.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activeTab === 'purchase' ? item.supplier : item.customer).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CreateReturnModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New {activeTab === 'purchase' ? 'Purchase' : 'Sales'} Return</h2>
          <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Order Number</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter order number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === 'purchase' ? 'Supplier' : 'Customer'}
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select {activeTab === 'purchase' ? 'supplier' : 'customer'}</option>
                <option>{activeTab === 'purchase' ? 'ABC Electronics Ltd' : 'Johnson & Associates'}</option>
                <option>{activeTab === 'purchase' ? 'Tech Solutions Inc' : 'Global Marketing Corp'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select reason</option>
                <option>Defective items</option>
                <option>Wrong specification</option>
                <option>Excess inventory</option>
                <option>Customer dissatisfaction</option>
                <option>Warranty claim</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="Enter any additional notes..."></textarea>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Return Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <select className="w-full border border-gray-300 rounded px-2 py-1">
                        <option>Select item</option>
                        <option>Wireless Mouse</option>
                        <option>USB Cable</option>
                        <option>Keyboard</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="0" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="0.00" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Reason" />
                    </td>
                    <td className="px-4 py-3 font-medium">$0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Item
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Return Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReturnDetailsModal = ({ returnData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Return Order Details</h2>
          <button onClick={() => setSelectedReturn(null)} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Return Number</label>
              <p className="text-lg font-semibold">{returnData.returnNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Original Order</label>
              <p className="text-gray-900">{returnData.originalOrder}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {activeTab === 'purchase' ? 'Supplier' : 'Customer'}
              </label>
              <p className="text-gray-900">{activeTab === 'purchase' ? returnData.supplier : returnData.customer}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Return Date</label>
              <p className="text-gray-900">{returnData.returnDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(returnData.status)}`}>
                {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Return Reason</label>
              <p className="text-gray-900">{returnData.reason}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Return Items</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {returnData.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">{item.reason}</td>
                    <td className="px-4 py-3 font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Return Amount:</span>
            <span className="text-lg font-bold text-gray-900">${returnData.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Edit className="w-4 h-4 inline mr-2" />
            Edit Return
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Returns Management</h1>
          <p className="text-gray-600">Manage purchase order returns and sales order returns</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('purchase')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'purchase'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Purchase Returns
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Sales Returns
              </button>
            </nav>
          </div>

          {/* Filters and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Return
              </button>
            </div>
          </div>

          {/* Returns Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'purchase' ? 'Supplier' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{returnItem.returnNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.originalOrder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activeTab === 'purchase' ? returnItem.supplier : returnItem.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{returnItem.returnDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${returnItem.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReturns.length}</span> of{' '}
                  <span className="font-medium">{filteredReturns.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{currentReturns.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentReturns.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentReturns.filter(item => item.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentReturns.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateReturnModal />}
      {selectedReturn && <ReturnDetailsModal returnData={selectedReturn} />}
    </div>
  );
};

export default ReturnsOrderUI;