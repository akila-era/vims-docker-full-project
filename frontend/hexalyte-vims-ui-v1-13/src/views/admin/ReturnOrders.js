import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronDown, Package, Calendar, DollarSign, User, ArrowLeft, Eye, Check, X, Clock, AlertCircle, PlusCircle } from 'lucide-react';
import { createAxiosInstance } from 'api/axiosInstance';
import AddSalesReturnModal from 'components/Modal/AddSalesReturnModal';

const ReturnOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnOrders, setReturnOrders] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Sample data matching your API structure
  // const returnOrders = [
  //   {
  //     "ReturnID": 1,
  //     "SalesOrderID": 1,
  //     "PurchaseOrderID": null,
  //     "ReturnDate": "2025-08-05T00:00:00.000Z",
  //     "Reason": "Defective item",
  //     "CreatedBy": 1,
  //     "createdAt": "2025-08-06T07:24:11.000Z",
  //     "updatedAt": "2025-08-06T07:24:11.000Z",
  //     "returnorderitems": [
  //       {
  //         "id": 1,
  //         "ReturnID": 1,
  //         "ProductID": 1,
  //         "Quantity": 5,
  //         "Note": "Item damaged during shipping",
  //         "createdAt": "2025-08-06T07:24:11.000Z",
  //         "updatedAt": "2025-08-06T07:24:11.000Z"
  //       },
  //       {
  //         "id": 2,
  //         "ReturnID": 1,
  //         "ProductID": 2,
  //         "Quantity": 2,
  //         "Note": "Wrong color received",
  //         "createdAt": "2025-08-06T07:24:11.000Z",
  //         "updatedAt": "2025-08-06T07:24:11.000Z"
  //       }
  //     ]
  //   },
  //   {
  //     "ReturnID": 2,
  //     "SalesOrderID": 3,
  //     "PurchaseOrderID": null,
  //     "ReturnDate": "2025-08-05T00:00:00.000Z",
  //     "Reason": "Wrong size",
  //     "CreatedBy": 1,
  //     "createdAt": "2025-08-06T07:27:22.000Z",
  //     "updatedAt": "2025-08-06T07:27:22.000Z",
  //     "returnorderitems": [
  //       {
  //         "id": 3,
  //         "ReturnID": 2,
  //         "ProductID": 1,
  //         "Quantity": 1,
  //         "Note": "",
  //         "createdAt": "2025-08-06T07:27:22.000Z",
  //         "updatedAt": "2025-08-06T07:27:22.000Z"
  //       },
  //       {
  //         "id": 4,
  //         "ReturnID": 2,
  //         "ProductID": 3,
  //         "Quantity": 1,
  //         "Note": "",
  //         "createdAt": "2025-08-06T07:27:22.000Z",
  //         "updatedAt": "2025-08-06T07:27:22.000Z"
  //       }
  //     ]
  //   },
  //   {
  //     "ReturnID": 3,
  //     "SalesOrderID": 2,
  //     "PurchaseOrderID": null,
  //     "ReturnDate": "2025-08-05T00:00:00.000Z",
  //     "Reason": "Not as described",
  //     "CreatedBy": 1,
  //     "createdAt": "2025-08-06T07:35:56.000Z",
  //     "updatedAt": "2025-08-06T07:35:56.000Z",
  //     "returnorderitems": [
  //       {
  //         "id": 5,
  //         "ReturnID": 3,
  //         "ProductID": 1,
  //         "Quantity": 1,
  //         "Note": "Product quality not as expected",
  //         "createdAt": "2025-08-06T07:35:56.000Z",
  //         "updatedAt": "2025-08-06T07:35:56.000Z"
  //       },
  //       {
  //         "id": 6,
  //         "ReturnID": 3,
  //         "ProductID": 2,
  //         "Quantity": 1,
  //         "Note": "",
  //         "createdAt": "2025-08-06T07:35:56.000Z",
  //         "updatedAt": "2025-08-06T07:35:56.000Z"
  //       }
  //     ]
  //   }
  // ];

  // Product mapping (you can expand this based on your actual product data)
  // const productMap = {
  //   1: { name: 'Product A', price: 50.00 },
  //   2: { name: 'Product B', price: 30.00 },
  //   3: { name: 'Product C', price: 75.00 },
  // };

  async function fetchReturnOrders() {
    try {

      const api = createAxiosInstance()
      const returnOrdersRes = await api.get('return/salesorder')

      if (returnOrdersRes.status === 200) {
        setReturnOrders(() => returnOrdersRes.data.allReturnOrders)
      }

    } catch (error) {
      console.log(error)
    }
  }

  // async function fetchProducts() {
  //   try {

  //     const api = createAxiosInstance()
  //     const productsRes = await api.get('product')

  //     if (productsRes.status === 200) {
  //       console.log({...productsRes.data.allProducts})
  //       setProductMap(() => ({...productsRes.data.allProducts}))
  //     }

  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // const filteredReturns =() => {
  //   return returnOrders.filter(returnOrder => {
  //     const matchesSearch =
  //       returnOrder.ReturnID.toString().includes(searchTerm.toLowerCase()) ||
  //       returnOrder.SalesOrderID.toString().includes(searchTerm.toLowerCase()) ||
  //       returnOrder.Reason.toLowerCase().includes(searchTerm.toLowerCase());

  //     return matchesSearch;
  //   });
  // };

  const filteredReturns = returnOrders.filter(returnOrder => {
    const matchesSearch =
      returnOrder.ReturnID.toString().includes(searchTerm.toLowerCase()) ||
      returnOrder.SalesOrderID.toString().includes(searchTerm.toLowerCase()) ||
      returnOrder.Reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  useEffect(() => {
    fetchReturnOrders()
    // fetchProducts()
  }, [])

  if (selectedReturn) {
    return (
      <div className="bg-white min-h-screen">
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
                <p className="text-sm text-gray-500">Return ID: {selectedReturn.ReturnID}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Return ID:</span> {selectedReturn.ReturnID}</div>
                <div><span className="font-medium">Sales Order ID:</span> {selectedReturn.SalesOrderID}</div>
                {selectedReturn.PurchaseOrderID && (
                  <div><span className="font-medium">Purchase Order ID:</span> {selectedReturn.PurchaseOrderID}</div>
                )}
                <div><span className="font-medium">Created By User:</span> {selectedReturn.CreatedBy}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Return Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Return Date:</span> {new Date(selectedReturn.ReturnDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Reason:</span> {selectedReturn.Reason}</div>
                <div><span className="font-medium">Created:</span> {new Date(selectedReturn.createdAt).toLocaleDateString()}</div>
                <div><span className="font-medium">Last Updated:</span> {new Date(selectedReturn.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Items</div>
                <div className="font-semibold text-lg">{selectedReturn.returnorderitems.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Quantity</div>
                <div className="font-semibold text-lg">
                  {selectedReturn.returnorderitems.reduce((sum, item) => sum + item.Quantity, 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Unique Products</div>
                <div className="font-semibold text-lg">
                  {new Set(selectedReturn.returnorderitems.map(item => item.ProductID)).size}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Returned Items
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Note</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Est. Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedReturn.returnorderitems.map((item) => {
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-mono">{item.ProductID}</td>
                        <td className="px-4 py-3 text-sm">{item.product.Name}</td>
                        <td className="px-4 py-3 text-sm">{item.Quantity}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.Note ? (
                            <span className="text-gray-900">{item.Note}</span>
                          ) : (
                            <span className="text-gray-400 italic">No note</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {(Number(item.product.SellingPrice) * Number(item.Quantity))} LKR
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* <div className="flex gap-3 pt-4 border-t">
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Process Return
            </button>
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Contact Customer
            </button>
            <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Print Details
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
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

      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by return ID, sales order ID, or reason..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 border text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Return
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Returns</div>
            <div className="text-2xl font-bold text-gray-900">{returnOrders.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Recent Returns</div>
            <div className="text-2xl font-bold text-blue-600">
              {returnOrders.filter(r => new Date() - new Date(r.createdAt) < 7 * 24 * 60 * 60 * 1000).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Total Items</div>
            <div className="text-2xl font-bold text-green-600">
              {returnOrders.reduce((sum, r) => sum + r.returnorderitems.reduce((itemSum, item) => itemSum + item.Quantity, 0), 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Avg Items/Return</div>
            <div className="text-2xl font-bold text-purple-600">
              {returnOrders.length > 0 ?
                Math.round(returnOrders.reduce((sum, r) => sum + r.returnorderitems.length, 0) / returnOrders.length * 10) / 10
                : 0}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Return ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Sales Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Return Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Reason</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Items Count</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total Quantity</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReturns.map((returnOrder) => (
              <tr key={returnOrder.ReturnID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{returnOrder.ReturnID}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono text-gray-900">{returnOrder.SalesOrderID}</div>
                  {returnOrder.PurchaseOrderID && (
                    <div className="text-xs text-gray-500">{returnOrder.PurchaseOrderID}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(returnOrder.ReturnDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(returnOrder.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{returnOrder.Reason}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {returnOrder.returnorderitems.length}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {returnOrder.returnorderitems.reduce((sum, item) => sum + item.Quantity, 0)}
                  </div>
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

      <AddSalesReturnModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {filteredReturns.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'No return requests have been submitted yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;