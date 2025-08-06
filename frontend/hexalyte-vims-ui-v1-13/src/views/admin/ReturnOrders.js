import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Package, Calendar, DollarSign, User, ArrowLeft, Eye, Check, X, Clock, AlertCircle } from 'lucide-react';

const ReturnOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for return orders
  const returnOrders = [
    {
      id: 'RET-001',
      orderId: '512254252',
      customerName: 'Sarah Queen',
      customerEmail: 'yourname@email.com',
      returnDate: '2025-08-05',
      status: 'pending',
      reason: 'Defective item',
      totalAmount: 224.20,
      refundAmount: 224.20,
      items: [
        { name: 'Item 01', quantity: 1, price: 32.03, condition: 'damaged' },
        { name: 'Item 02', quantity: 1, price: 45.50, condition: 'unopened' },
        { name: 'Item 03', quantity: 1, price: 146.67, condition: 'used' }
      ]
    },
    {
      id: 'RET-002',
      orderId: '512254251',
      customerName: 'John Doe',
      customerEmail: 'john.doe@email.com',
      returnDate: '2025-08-04',
      status: 'approved',
      reason: 'Wrong size',
      totalAmount: 156.80,
      refundAmount: 140.12,
      items: [
        { name: 'Item 05', quantity: 2, price: 78.40, condition: 'unopened' }
      ]
    },
    {
      id: 'RET-003',
      orderId: '512254250',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@email.com',
      returnDate: '2025-08-03',
      status: 'completed',
      reason: 'Not as described',
      totalAmount: 89.99,
      refundAmount: 89.99,
      items: [
        { name: 'Item 07', quantity: 1, price: 89.99, condition: 'unopened' }
      ]
    },
    {
      id: 'RET-004',
      orderId: '512254249',
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@email.com',
      returnDate: '2025-08-02',
      status: 'rejected',
      reason: 'Changed mind',
      totalAmount: 299.99,
      refundAmount: 0,
      items: [
        { name: 'Item 04', quantity: 1, price: 299.99, condition: 'used' }
      ]
    }
  ];

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-800', icon: Check, label: 'Approved' },
    completed: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Completed' },
    rejected: { color: 'bg-red-100 text-red-800', icon: X, label: 'Rejected' }
  };

  const conditionConfig = {
    unopened: { color: 'bg-green-100 text-green-800', label: 'Unopened' },
    used: { color: 'bg-yellow-100 text-yellow-800', label: 'Used' },
    damaged: { color: 'bg-red-100 text-red-800', label: 'Damaged' }
  };

  const filteredReturns = useMemo(() => {
    return returnOrders.filter(returnOrder => {
      const matchesSearch = 
        returnOrder.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnOrder.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnOrder.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || returnOrder.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const ConditionBadge = ({ condition }) => {
    const config = conditionConfig[condition];
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (selectedReturn) {
    return (
      <div className="bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedReturn(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
                <p className="text-sm text-gray-500">Return ID: {selectedReturn.id}</p>
              </div>
            </div>
            <StatusBadge status={selectedReturn.status} />
          </div>
        </div>

        {/* Return Details */}
        <div className="p-6 space-y-6">
          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {selectedReturn.customerName}</div>
                <div><span className="font-medium">Email:</span> {selectedReturn.customerEmail}</div>
                <div><span className="font-medium">Original Order:</span> #{selectedReturn.orderId}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Return Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Return Date:</span> {new Date(selectedReturn.returnDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Reason:</span> {selectedReturn.reason}</div>
                <div><span className="font-medium">Status:</span> <StatusBadge status={selectedReturn.status} /></div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Original Amount</div>
                <div className="font-semibold text-lg">${selectedReturn.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600">Refund Amount</div>
                <div className="font-semibold text-lg text-green-600">${selectedReturn.refundAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600">Processing Fee</div>
                <div className="font-semibold text-lg">${(selectedReturn.totalAmount - selectedReturn.refundAmount).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600">Items Count</div>
                <div className="font-semibold text-lg">{selectedReturn.items.length}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Returned Items
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Condition</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedReturn.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <ConditionBadge condition={item.condition} />
                      </td>
                      <td className="px-4 py-3 text-sm text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          {selectedReturn.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Approve Return
              </button>
              <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Reject Return
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Order Returns</h1>
            <p className="text-sm text-gray-500">Manage and track product return requests</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {filteredReturns.length} of {returnOrders.length} returns
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by return ID, order ID, or customer name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Returns</div>
            <div className="text-2xl font-bold text-gray-900">{returnOrders.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {returnOrders.filter(r => r.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-blue-600">
              {returnOrders.filter(r => r.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {returnOrders.filter(r => r.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Return ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Reason</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReturns.map((returnOrder) => (
              <tr key={returnOrder.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{returnOrder.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{returnOrder.customerName}</div>
                    <div className="text-sm text-gray-500">{returnOrder.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono text-gray-900">#{returnOrder.orderId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(returnOrder.returnDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{returnOrder.reason}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    ${returnOrder.refundAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    of ${returnOrder.totalAmount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={returnOrder.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedReturn(returnOrder)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredReturns.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No return requests have been submitted yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;