import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import ReactMenu from "components/Menus/ReactMenu";
import SalesOrderAddModal from "components/Modal/SalesOrderAddModal";
import SalesOrderInfoModal from "../../components/Modal/SalesOrderInfoModal";
import checkToken from "../../api/checkToken";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router-dom";
import handleUserLogout from "../../api/logout";
import axios from "axios";
import SalesInvoiceModal from "components/Modal/SalesInvoiceModal";
import Swal from "sweetalert2";
import printHandler from "components/Invoice/PrintReceipt";
import handlePrint from "components/Print/handlePrint";
import handlePrintSalesOrderTable from "components/Print/handlePrintSalesOrderTable";
import PaymentActionButton from "components/buttons/PaymentActionButton";
import { createAxiosInstance } from "api/axiosInstance";

// const BASE_URL = process.env.REACT_APP_BASE_URL;

const TOKEN = localStorage.getItem('user') ? JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(localStorage.getItem('user')), c => c.charCodeAt(0)))).tokens.access.token : null

function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [openSalesOrderDetailModal, setOpenSalesOrderDetailModal] = useState(null);
  const [openSalesOrderUpdateModal, setOpenSalesOrderUpdateModal] = useState(null);
  const [openAddSalesOrderModal, setOpenAddSalesOrderModal] = useState(false);
  const [openSalesInvoiceModal, setOpenSalesInvoiceModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState('');

  // const [customerInfo, setCustomerInfo] = useState();
  // const [customerAddress, setCustomerAddress] = useState();
  // const [orderItems, setOrderItems] = useState();

  const { setAuth } = useAuth();
  const history = useHistory();

  //   const printOrder = async (order) => {
  //     const printWindow = window.open('', '_blank');
  //     const currentDate = new Date().toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     });

  //     const orderDate = new Date(order.OrderDate).toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     });

  //     const api = createAxiosInstance()
  //     const orderItemsRes = await api.get(`salesorderdetails/${order.OrderID}`) || []
  //     const orderItems = orderItemsRes.data.data || []

  //     const orderRows = orderItems.map((orderItem, index) => {
  //       return `
  //         <tr class="order-row">
  //           <td class="product-id">#${orderItem.ProductId}</td>
  //           <td class="quantity">${orderItem.Quantity}</td>
  //           <td class="unit-price">${Number(orderItem.UnitPrice)?.toLocaleString() || '0'}</td>
  //           <td class="total-price">${(Number(orderItem.UnitPrice) * Number(orderItem.Quantity))?.toLocaleString() || '0'}</td>
  //         </tr>
  //       `
  //     }).join('')

  //     const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.UnitPrice) * Number(item.Quantity)), 0);

  //     const printContent = `
  //       <!DOCTYPE html>
  //       <html>
  //       <head>
  //         <title>Sales Order #${order.OrderID}</title>
  //         <meta charset="UTF-8">
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //         <style>
  //           * {
  //             margin: 0;
  //             padding: 0;
  //             box-sizing: border-box;
  //           }

  //           body {
  //             font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  //             background: #f8fafc;
  //             color: #1e293b;
  //             line-height: 1.0;
  //             padding: 20px;
  //             margin: 0;
  //           }

  //           .invoice-container {
  //             width: 210mm;
  //             min-height: 297mm;
  //             max-width: 210mm;
  //             margin: 0 auto;
  //             background: white;
  //             border-radius: 8px;
  //             box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.08);
  //             overflow: hidden;
  //             border: 1px solid #e2e8f0;
  //             page-break-after: always;
  //           }

  //           .header {
  //             background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  //             color: white;
  //             padding: 20mm 15mm 10mm 15mm;
  //             position: relative;
  //           }

  //           .header::after {
  //             content: '';
  //             position: absolute;
  //             bottom: 0;
  //             left: 0;
  //             right: 0;
  //             height: 2px;
  //             background: linear-gradient(90deg, #3b82f6, #1d4ed8, #1e40af);
  //           }

  //           .company-name {
  //             font-size: 2rem;
  //             font-weight: 700;
  //             margin-bottom: 8px;
  //             letter-spacing: -0.025em;
  //           }

  //           .company-tagline {
  //             font-size: 0.875rem;
  //             opacity: 0.9;
  //             margin-bottom: 12px;
  //             font-weight: 500;
  //             text-transform: uppercase;
  //             letter-spacing: 0.5px;
  //           }

  //           .company-address {
  //             font-size: 0.875rem;
  //             opacity: 0.85;
  //             margin-bottom: 24px;
  //             line-height: 1;
  //           }

  //           .document-title {
  //             font-size: 1rem;
  //             font-weight: 600;
  //             background: rgba(255, 255, 255, 0.15);
  //             padding: 12px 24px;
  //             border-radius: 6px;
  //             display: inline-block;
  //             backdrop-filter: blur(10px);
  //             border: 1px solid rgba(255, 255, 255, 0.2);
  //           }

  //           .content {
  //             padding: 15mm 20mm;
  //           }

  //           .print-date {
  //             text-align: right;
  //             color: #64748b;
  //             font-size: 0.875rem;
  //             margin-bottom: 20px;
  //             font-weight: 500;
  //           }

  //           .order-info {
  //             display: grid;
  //             grid-template-columns: 1fr 1fr;
  //             gap: 20px;
  //             margin-bottom: 25px;
  //           }

  //           .info-card {
  //             background: #f8fafc;
  //             border: 1px solid #e2e8f0;
  //             border-radius: 6px;
  //             padding: 18px;
  //             transition: all 0.2s ease;
  //           }

  //           .info-card:hover {
  //             border-color: #cbd5e1;
  //             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  //           }

  //           .info-title {
  //             font-size: 1rem;
  //             font-weight: 700;
  //             color: #1e293b;
  //             margin-bottom: 14px;
  //             padding-bottom: 8px;
  //             border-bottom: 2px solid #3b82f6;
  //             text-transform: uppercase;
  //             letter-spacing: 0.5px;
  //             font-size: 0.975rem;
  //           }

  //           .info-item {
  //             display: flex;
  //             justify-content: space-between;
  //             align-items: center;
  //             margin-bottom: 6px;
  //             padding: 8px 0;
  //             border-bottom: 1px solid #f1f5f9;
  //           }

  //           .info-item:last-child {
  //             border-bottom: none;
  //             margin-bottom: 0;
  //           }

  //           .info-label {
  //             font-weight: 600;
  //             color: #475569;
  //             font-size: 0.875rem;
  //           }

  //           .info-value {
  //             font-weight: 600;
  //             color: #1e293b;
  //             text-align: right;
  //           }

  //           .status-badge {
  //             padding: 6px 12px;
  //             border-radius: 4px;
  //             font-size: 0.75rem;
  //             font-weight: 700;
  //             text-transform: uppercase;
  //             letter-spacing: 0.5px;
  //             border: 1px solid transparent;
  //           }

  //           .status-completed { 
  //             background: #dcfce7; 
  //             color: #166534; 
  //             border-color: #bbf7d0;
  //           }
  //           .status-pending { 
  //             background: #fef3c7; 
  //             color: #92400e; 
  //             border-color: #fde68a;
  //           }
  //           .status-cancelled { 
  //             background: #fee2e2; 
  //             color: #991b1b; 
  //             border-color: #fecaca;
  //           }
  //           .payment-paid { 
  //             background: #dcfce7; 
  //             color: #166534; 
  //             border-color: #bbf7d0;
  //           }
  //           .payment-unpaid { 
  //             background: #fee2e2; 
  //             color: #991b1b; 
  //             border-color: #fecaca;
  //           }

  //           .amount {
  //             font-size: 1 rem;
  //             font-weight: 800;
  //             color: #1e40af;
  //           }

  //           .table-container {
  //             background: white;
  //             border: 1px solid #e2e8f0;
  //             border-radius: 6px;
  //             overflow: hidden;
  //             margin-bottom: 20px;
  //           }

  //           .orders-table {
  //             width: 100%;
  //             border-collapse: collapse;
  //           }

  //           .orders-table th {
  //             background: #f8fafc;
  //             color: #374151;
  //             padding: 16px;
  //             text-align: left;
  //             font-weight: 700;
  //             font-size: 0.875rem;
  //             text-transform: uppercase;
  //             letter-spacing: 0.5px;
  //             border-bottom: 2px solid #e2e8f0;
  //           }

  //           .orders-table th:last-child {
  //             text-align: right;
  //           }

  //           .order-row {
  //             transition: background-color 0.15s ease;
  //           }

  //           .order-row:nth-child(even) {
  //             background: #f9fafb;
  //           }

  //           .order-row:hover {
  //             background: #f0f9ff;
  //           }

  //           .order-row td {
  //             padding: 10px 14px;
  //             border-bottom: 1px solid #f1f5f9;
  //             font-size: 0.875rem;
  //           }

  //           .order-row:last-child td {
  //             border-bottom: none;
  //           }

  //           .product-id {
  //             font-weight: 700;
  //             color: #1e40af;
  //             font-family: 'Monaco', 'Menlo', monospace;
  //           }

  //           .quantity {
  //             font-weight: 600;
  //             color: #374151;
  //             text-align: center;
  //           }

  //           .unit-price, .total-price {
  //             text-align: right;
  //             font-weight: 600;
  //             color: #374151;
  //             font-family: 'Monaco', 'Menlo', monospace;
  //           }

  //           .total-section {
  //             background: #f8fafc;
  //             border: 1px solid #e2e8f0;
  //             border-radius: 6px;
  //             padding: 18px;
  //             margin-top: 15px;
  //           }

  //           .total-row {
  //             display: flex;
  //             justify-content: space-between;
  //             align-items: center;
  //             padding: 8px 0;
  //             font-size: 0.975rem;
  //             font-weight: 600;
  //             color: #374151;
  //           }

  //           .total-row:last-child {
  //             font-size: 1.25rem;
  //             font-weight: 800;
  //             color: #1e293b;
  //             margin-top: 12px;
  //             padding-top: 16px;
  //             border-top: 2px solid #e2e8f0;
  //           }

  //           .total-row:last-child .total-amount {
  //             color: #1e40af;
  //             font-family: 'Monaco', 'Menlo', monospace;
  //           }

  //           .footer {
  //             margin-top: 25px;
  //             padding-top: 15px;
  //             border-top: 1px solid #e2e8f0;
  //             text-align: center;
  //           }

  //           .footer-content {
  //             background: #f8fafc;
  //             border: 1px solid #e2e8f0;
  //             border-radius: 6px;
  //             padding: 15px;
  //             color: #64748b;
  //             font-size: 0.875rem;
  //             line-height: 1.5;
  //           }

  //           .footer-title {
  //             font-weight: 700;
  //             color: #374151;
  //             margin-bottom: 5px;
  //             font-size: 0.975rem;
  //           }

  //           .divider {
  //             height: 1px;
  //             background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  //             margin: 10px 0;
  //           }

  //           @media print {
  //             @page {
  //               size: A4;
  //               margin: 0;
  //             }

  //             body { 
  //               background: white;
  //               padding: 0;
  //               margin: 0;
  //               -webkit-print-color-adjust: exact;
  //               print-color-adjust: exact;
  //             }

  //             .invoice-container {
  //               width: 210mm;
  //               min-height: 297mm;
  //               box-shadow: none;
  //               border: none;
  //               border-radius: 0;
  //               margin: 0;
  //               page-break-after: auto;
  //             }

  //             .header {
  //               padding: 15mm 15mm 5mm 15mm;
  //               background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  //               -webkit-print-color-adjust: exact;
  //               print-color-adjust: exact;
  //             }

  //             .content {
  //               padding: 5mm 15mm 15mm 15mm;
  //             }

  //             .no-print { 
  //               display: none; 
  //             }

  //             .info-card {
  //               break-inside: avoid;
  //             }

  //             .table-container {
  //               break-inside: avoid;
  //             }

  //             .total-section {
  //               break-inside: avoid;
  //             }

  //             .footer {
  //               break-inside: avoid;
  //             }
  //           }

  //           @media (max-width: 768px) {
  //             .order-info {
  //               grid-template-columns: 1fr;
  //               gap: 20px;
  //             }

  //             .content {
  //               padding: 30px 20px;
  //             }

  //             .header {
  //               padding: 30px 20px;
  //             }

  //             .company-name {
  //               font-size: 1.875rem;
  //             }

  //             .document-title {
  //               font-size: 1.5rem;
  //               padding: 10px 20px;
  //             }

  //             .orders-table th,
  //             .order-row td {
  //               padding: 12px 8px;
  //               font-size: 0.8rem;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="invoice-container">
  //           <div class="header">
  //             <div class="company-name">Ashoka Rubber Industries</div>
  //             <div class="company-tagline">Dealers in Radiator Hose, Air Cleaner Hose, Oil Hose and Power Steering Hose</div>
  //             <div class="company-address">No. 89, Ruwanpura, Hapugasthalawa<br>Tel: 0776 272 994, 0779 626 642</div>
  //             <div class="document-title">Sales Order</div>
  //           </div>

  //           <div class="content">
  //             <div class="print-date">Printed on: ${currentDate}</div>

  //             <div class="order-info">
  //               <div class="info-card">
  //                 <div class="info-title">Order Information</div>
  //                 <div class="info-item">
  //                   <span class="info-label">Order ID:</span>
  //                   <span class="info-value">#${order.OrderID}</span>
  //                 </div>
  //                 <div class="info-item">
  //                   <span class="info-label">Order Date:</span>
  //                   <span class="info-value">${orderDate}</span>
  //                 </div>
  //                 <div class="info-item">
  //                   <span class="info-label">Status:</span>
  //                   <span class="info-value">
  //                     <span class="status-badge status-${order.Status?.toLowerCase() || 'pending'}">${order.Status || 'Pending'}</span>
  //                   </span>
  //                 </div>
  //               </div>

  //               <div class="info-card">
  //                 <div class="info-title">Payment Information</div>
  //                 <div class="info-item">
  //                   <span class="info-label">Total Amount:</span>
  //                   <span class="info-value amount">${order.TotalAmount?.toLocaleString() || '0'} LKR</span>
  //                 </div>
  //                 <div class="info-item">
  //                   <span class="info-label">Payment Status:</span>
  //                   <span class="info-value">
  //                     <span class="status-badge payment-${order.PaymentStatus?.toLowerCase() || 'unpaid'}">${order.PaymentStatus || 'Unpaid'}</span>
  //                   </span>
  //                 </div>
  //               </div>
  //             </div>

  //             <div class="divider"></div>

  //             <div class="table-container">
  //               <table class="orders-table">
  //                 <thead>
  //                   <tr>
  //                     <th>Product ID</th>
  //                     <th>Quantity</th>
  //                     <th>Unit Price (LKR)</th>
  //                     <th>Total (LKR)</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody>
  //                   ${orderRows}
  //                 </tbody>
  //               </table>
  //             </div>

  //             <div class="total-section">
  //               <div class="total-row">
  //                 <span>Subtotal:</span>
  //                 <span class="total-amount">${subtotal.toLocaleString()} LKR</span>
  //               </div>
  //               <div class="total-row">
  //                 <span>Grand Total:</span>
  //                 <span class="total-amount">${order.TotalAmount?.toLocaleString() || subtotal.toLocaleString()} LKR</span>
  //               </div>
  //             </div>

  //             <div class="footer">
  //               <div class="footer-content">
  //                 <div class="footer-title">Thank you for your business</div>
  //                 <p>This is a computer-generated document. No signature is required.</p>
  //                 <p>Sales Order #${order.OrderID} | Generated on ${currentDate}</p>
  //                 <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8;">
  //                   Software by: Hexalyte Technology LTD
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <script>
  //           window.onload = function() {
  //             setTimeout(() => {
  //               window.print();
  //               window.onafterprint = function() {
  //                 window.close();
  //               };
  //             }, 300);
  //           };
  //         </script>
  //       </body>
  //       </html>
  //     `;

  //     printWindow.document.write(printContent);
  //     printWindow.document.close();
  // };

  // const printOrder = async (order) => {
  //   const printWindow = window.open('', '_blank');
  //   const currentDate = new Date().toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });

  //   const orderDate = new Date(order.OrderDate).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });

  //   const api = createAxiosInstance()
  //   const orderItemsRes = await api.get(`salesorderdetails/${order.OrderID}`) || []
  //   const orderItems = orderItemsRes.data.data || []

  //   const orderRows = orderItems.map((orderItem, index) => {
  //     return `
  //       <tr>
  //         <td class="item-name">Product #${orderItem.ProductId}</td>
  //         <td class="quantity">${orderItem.Quantity}</td>
  //         <td class="price">${Number(orderItem.UnitPrice)?.toLocaleString() || '0'}</td>
  //         <td class="total">${(Number(orderItem.UnitPrice) * Number(orderItem.Quantity))?.toLocaleString() || '0'}</td>
  //       </tr>
  //     `
  //   }).join('')

  //   const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.UnitPrice) * Number(item.Quantity)), 0);

  //   // const printContent = `
  //   //   <!DOCTYPE html>
  //   //   <html>
  //   //   <head>
  //   //     <title>Sales Order #${order.OrderID}</title>
  //   //     <meta charset="UTF-8">
  //   //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //   //     <style>
  //   //       * {
  //   //         margin: 0;
  //   //         padding: 0;
  //   //         box-sizing: border-box;
  //   //       }

  //   //       body {
  //   //         font-family: Arial, sans-serif;
  //   //         background: #f5f5f5;
  //   //         color: #333;
  //   //         line-height: 1.4;
  //   //         padding: 20px;
  //   //       }

  //   //       .invoice-container {
  //   //         max-width: 800px;
  //   //         margin: 0 auto;
  //   //         background: white;
  //   //         border-radius: 8px;
  //   //         overflow: hidden;
  //   //         box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  //   //       }

  //   //       .header {
  //   //         background: #4a5d23;
  //   //         color: white;
  //   //         padding: 30px;
  //   //         text-align: left;
  //   //       }

  //   //       .invoice-title {
  //   //         font-size: 2.5rem;
  //   //         font-weight: bold;
  //   //         margin-bottom: 20px;
  //   //         letter-spacing: 2px;
  //   //       }

  //   //       .invoice-details {
  //   //         display: grid;
  //   //         grid-template-columns: repeat(4, 1fr);
  //   //         gap: 20px;
  //   //         margin-bottom: 20px;
  //   //       }

  //   //       .detail-item {
  //   //         text-align: center;
  //   //       }

  //   //       .detail-label {
  //   //         font-size: 0.9rem;
  //   //         margin-bottom: 5px;
  //   //         opacity: 0.9;
  //   //       }

  //   //       .detail-value {
  //   //         font-size: 1.1rem;
  //   //         font-weight: bold;
  //   //       }

  //   //       .content {
  //   //         padding: 30px;
  //   //       }

  //   //       .billing-section {
  //   //         display: grid;
  //   //         grid-template-columns: 1fr 1fr;
  //   //         gap: 40px;
  //   //         margin-bottom: 40px;
  //   //       }

  //   //       .billing-block h3 {
  //   //         font-size: 1.1rem;
  //   //         margin-bottom: 10px;
  //   //         color: #333;
  //   //         font-weight: bold;
  //   //       }

  //   //       .billing-block p {
  //   //         margin: 3px 0;
  //   //         font-size: 0.95rem;
  //   //         color: #666;
  //   //       }

  //   //       .items-table {
  //   //         width: 100%;
  //   //         border-collapse: collapse;
  //   //         margin-bottom: 30px;
  //   //       }

  //   //       .items-table thead {
  //   //         background: #f8f9fa;
  //   //       }

  //   //       .items-table th {
  //   //         padding: 15px 10px;
  //   //         text-align: left;
  //   //         font-weight: bold;
  //   //         color: #333;
  //   //         border-bottom: 2px solid #dee2e6;
  //   //         font-size: 0.95rem;
  //   //       }

  //   //       .items-table th:last-child,
  //   //       .items-table td:last-child {
  //   //         text-align: right;
  //   //       }

  //   //       .items-table td {
  //   //         padding: 12px 10px;
  //   //         border-bottom: 1px solid #eee;
  //   //         color: #555;
  //   //         font-size: 0.9rem;
  //   //       }

  //   //       .items-table tr:hover {
  //   //         background: #f8f9fa;
  //   //       }

  //   //       .item-name {
  //   //         font-weight: 500;
  //   //       }

  //   //       .quantity {
  //   //         text-align: center;
  //   //       }

  //   //       .price, .total {
  //   //         font-family: monospace;
  //   //       }

  //   //       .totals-section {
  //   //         border-top: 2px solid #dee2e6;
  //   //         padding-top: 20px;
  //   //       }

  //   //       .totals-table {
  //   //         width: 100%;
  //   //         max-width: 300px;
  //   //         margin-left: auto;
  //   //       }

  //   //       .totals-table tr {
  //   //         border: none;
  //   //       }

  //   //       .totals-table td {
  //   //         padding: 8px 0;
  //   //         border: none;
  //   //         font-size: 0.95rem;
  //   //       }

  //   //       .totals-table td:first-child {
  //   //         text-align: right;
  //   //         padding-right: 20px;
  //   //         color: #666;
  //   //       }

  //   //       .totals-table td:last-child {
  //   //         text-align: right;
  //   //         font-family: monospace;
  //   //         color: #333;
  //   //       }

  //   //       .total-row {
  //   //         border-top: 2px solid #333 !important;
  //   //         font-weight: bold;
  //   //         font-size: 1.1rem !important;
  //   //       }

  //   //       .total-row td {
  //   //         padding-top: 15px !important;
  //   //         color: #333 !important;
  //   //       }

  //   //       .footer {
  //   //         background: #4a5d23;
  //   //         color: white;
  //   //         padding: 20px 30px;
  //   //         text-align: center;
  //   //       }

  //   //       .footer h3 {
  //   //         font-size: 1.2rem;
  //   //         margin-bottom: 10px;
  //   //       }

  //   //       .footer p {
  //   //         margin: 5px 0;
  //   //         opacity: 0.9;
  //   //         font-size: 0.9rem;
  //   //       }

  //   //       .company-info {
  //   //         margin-top: 15px;
  //   //         padding-top: 15px;
  //   //         border-top: 1px solid rgba(255,255,255,0.3);
  //   //         font-size: 0.8rem;
  //   //         opacity: 0.8;
  //   //       }

  //   //       @media print {
  //   //         body {
  //   //           background: white;
  //   //           padding: 0;
  //   //         }

  //   //         .invoice-container {
  //   //           box-shadow: none;
  //   //           border-radius: 0;
  //   //           max-width: none;
  //   //         }

  //   //         @page {
  //   //           margin: 15mm;
  //   //           size: A4;
  //   //         }
  //   //       }

  //   //       @media (max-width: 768px) {
  //   //         .invoice-details {
  //   //           grid-template-columns: repeat(2, 1fr);
  //   //           gap: 15px;
  //   //         }

  //   //         .billing-section {
  //   //           grid-template-columns: 1fr;
  //   //           gap: 20px;
  //   //         }

  //   //         .items-table th,
  //   //         .items-table td {
  //   //           padding: 8px 5px;
  //   //           font-size: 0.8rem;
  //   //         }
  //   //       }
  //   //     </style>
  //   //   </head>
  //   //   <body>
  //   //     <div class="invoice-container">
  //   //       <div class="header">
  //   //         <div class="invoice-title">SALES ORDER</div>
  //   //         <div class="invoice-details">
  //   //           <div class="detail-item">
  //   //             <div class="detail-label">N. SALES ORDER</div>
  //   //             <div class="detail-value">${order.OrderID}</div>
  //   //           </div>
  //   //           <div class="detail-item">
  //   //             <div class="detail-label">DATE</div>
  //   //             <div class="detail-value">${orderDate}</div>
  //   //           </div>
  //   //           <div class="detail-item">
  //   //             <div class="detail-label">PAYMENT STATUS</div>
  //   //             <div class="detail-value">${order.PaymentStatus || 'PENDING'}</div>
  //   //           </div>
  //   //           <div class="detail-item">
  //   //             <div class="detail-label">AMOUNT DUE</div>
  //   //             <div class="detail-value">${order.TotalAmount?.toLocaleString() || '0'} LKR</div>
  //   //           </div>
  //   //         </div>
  //   //       </div>

  //   //       <div class="content">
  //   //         <div class="billing-section">
  //   //           <div class="billing-block">
  //   //             <h3>BILL TO:</h3>
  //   //             <p><strong>CUSTOMER</strong></p>
  //   //             <p>Customer Address Line 1</p>
  //   //             <p>Customer Address Line 2</p>
  //   //             <p>Phone Number</p>
  //   //             <p>customer@email.com</p>
  //   //           </div>
  //   //           <div class="billing-block">
  //   //             <h3>BILL FROM:</h3>
  //   //             <p><strong>ASHOKA RUBBER INDUSTRIES</strong></p>
  //   //             <p>No. 89, Ruwanpura, Hapugasthalawa</p>
  //   //             <p>Tel: 0776 272 994, 0779 626 642</p>
  //   //             <p>info@ashokarubber.com</p>
  //   //           </div>
  //   //         </div>

  //   //         <table class="items-table">
  //   //           <thead>
  //   //             <tr>
  //   //               <th>Items</th>
  //   //               <th>Quantity</th>
  //   //               <th>Price (LKR)</th>
  //   //               <th>Total Amount (LKR)</th>
  //   //             </tr>
  //   //           </thead>
  //   //           <tbody>
  //   //             ${orderRows}
  //   //           </tbody>
  //   //         </table>

  //   //         <div class="totals-section">
  //   //           <table class="totals-table">
  //   //             <tr>
  //   //               <td>SUBTOTAL</td>
  //   //               <td>${subtotal.toLocaleString()} LKR</td>
  //   //             </tr>
  //   //             <tr>
  //   //               <td>TAX (0%)</td>
  //   //               <td>0 LKR</td>
  //   //             </tr>
  //   //             <tr class="total-row">
  //   //               <td>TOTAL</td>
  //   //               <td>${order.TotalAmount?.toLocaleString() || subtotal.toLocaleString()} LKR</td>
  //   //             </tr>
  //   //           </table>
  //   //         </div>
  //   //       </div>

  //   //       <div class="footer">
  //   //         <h3>THANK YOU!</h3>
  //   //         <p>This is a computer-generated document. No signature is required.</p>
  //   //         <p>Sales Order #${order.OrderID} | Generated on ${currentDate}</p>
  //   //         <div class="company-info">
  //   //           Software by: Hexalyte Technology LTD
  //   //         </div>
  //   //       </div>
  //   //     </div>

  //   //     <script>
  //   //       window.onload = function() {
  //   //         setTimeout(() => {
  //   //           window.print();
  //   //           window.onafterprint = function() {
  //   //             window.close();
  //   //           };
  //   //         }, 300);
  //   //       };
  //   //     </script>
  //   //   </body>
  //   //   </html>
  //   // `;

  //   const printContent = `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Sales Order #${order.OrderID}</title>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <style>
  //         * {
  //           margin: 0;
  //           padding: 0;
  //           box-sizing: border-box;
  //         }

  //         body {
  //           font-family: 'Arial', sans-serif;
  //           background: #f8f9fa;
  //           color: #333;
  //           line-height: 1.6;
  //           padding: 20px;
  //         }

  //         .invoice-container {
  //           max-width: 800px;
  //           margin: 0 auto;
  //           background: white;
  //           border-radius: 0;
  //           overflow: hidden;
  //           box-shadow: none;
  //           border: 1px solid #e0e0e0;
  //         }

  //         .header {
  //           background: #4a5d23;
  //           color: white;
  //           padding: 40px 30px 30px;
  //           text-align: left;
  //           position: relative;
  //         }

  //         .invoice-title {
  //           font-size: 2.8rem;
  //           font-weight: 300;
  //           margin-bottom: 30px;
  //           letter-spacing: 3px;
  //           text-transform: uppercase;
  //         }

  //         .invoice-details {
  //           display: grid;
  //           grid-template-columns: repeat(4, 1fr);
  //           gap: 30px;
  //           margin-bottom: 0;
  //         }

  //         .detail-item {
  //           text-align: left;
  //         }

  //         .detail-label {
  //           font-size: 0.85rem;
  //           margin-bottom: 8px;
  //           opacity: 0.8;
  //           font-weight: 500;
  //           text-transform: uppercase;
  //           letter-spacing: 1px;
  //         }

  //         .detail-value {
  //           font-size: 1.2rem;
  //           font-weight: 600;
  //           color: #fff;
  //         }

  //         .content {
  //           padding: 40px 30px;
  //         }

  //         .billing-section {
  //           display: grid;
  //           grid-template-columns: 1fr 1fr;
  //           gap: 50px;
  //           margin-bottom: 50px;
  //           padding-bottom: 30px;
  //           border-bottom: 1px solid #e0e0e0;
  //         }

  //         .billing-block h3 {
  //           font-size: 0.9rem;
  //           margin-bottom: 15px;
  //           color: #666;
  //           font-weight: 600;
  //           text-transform: uppercase;
  //           letter-spacing: 1px;
  //         }

  //         .billing-block p {
  //           margin: 5px 0;
  //           font-size: 0.95rem;
  //           color: #333;
  //           line-height: 1.5;
  //         }

  //         .billing-block p strong {
  //           color: #000;
  //           font-weight: 600;
  //         }

  //         .items-table {
  //           width: 100%;
  //           border-collapse: collapse;
  //           margin-bottom: 40px;
  //           font-size: 0.9rem;
  //         }

  //         .items-table thead {
  //           background: #f8f9fa;
  //           border-top: 2px solid #4a5d23;
  //         }

  //         .items-table th {
  //           padding: 18px 15px;
  //           text-align: left;
  //           font-weight: 600;
  //           color: #333;
  //           border-bottom: 1px solid #e0e0e0;
  //           font-size: 0.85rem;
  //           text-transform: uppercase;
  //           letter-spacing: 0.5px;
  //         }

  //         .items-table th:last-child,
  //         .items-table td:last-child {
  //           text-align: right;
  //         }

  //         .items-table th:nth-child(2),
  //         .items-table td:nth-child(2) {
  //           text-align: center;
  //         }

  //         .items-table td {
  //           padding: 15px;
  //           border-bottom: 1px solid #f0f0f0;
  //           color: #555;
  //           font-size: 0.9rem;
  //         }

  //         .items-table tbody tr:hover {
  //           background: #f9f9f9;
  //         }

  //         .items-table tbody tr:last-child td {
  //           border-bottom: 2px solid #e0e0e0;
  //         }

  //         .item-name {
  //           font-weight: 500;
  //           color: #333;
  //         }

  //         .quantity {
  //           font-weight: 500;
  //         }

  //         .price, .total {
  //           font-family: 'Arial', sans-serif;
  //           font-weight: 500;
  //         }

  //         .totals-section {
  //           border-top: 2px solid #e0e0e0;
  //           padding-top: 30px;
  //           margin-top: 30px;
  //         }

  //         .totals-table {
  //           width: 100%;
  //           max-width: 350px;
  //           margin-left: auto;
  //         }

  //         .totals-table tr {
  //           border: none;
  //         }

  //         .totals-table td {
  //           padding: 12px 0;
  //           border: none;
  //           font-size: 0.95rem;
  //         }

  //         .totals-table td:first-child {
  //           text-align: right;
  //           padding-right: 30px;
  //           color: #666;
  //           font-weight: 500;
  //           text-transform: uppercase;
  //           letter-spacing: 0.5px;
  //         }

  //         .totals-table td:last-child {
  //           text-align: right;
  //           font-family: 'Arial', sans-serif;
  //           color: #333;
  //           font-weight: 600;
  //         }

  //         .total-row {
  //           border-top: 2px solid #4a5d23 !important;
  //           margin-top: 15px;
  //         }

  //         .total-row td {
  //           padding-top: 20px !important;
  //           color: #333 !important;
  //           font-size: 1.1rem !important;
  //           font-weight: 700 !important;
  //         }

  //         .footer {
  //           background: #f8f9fa;
  //           color: #333;
  //           padding: 30px;
  //           text-align: center;
  //           border-top: 1px solid #e0e0e0;
  //         }

  //         .footer h3 {
  //           font-size: 1.3rem;
  //           margin-bottom: 15px;
  //           color: #4a5d23;
  //           font-weight: 600;
  //           text-transform: uppercase;
  //           letter-spacing: 1px;
  //         }

  //         .footer p {
  //           margin: 8px 0;
  //           color: #666;
  //           font-size: 0.9rem;
  //           line-height: 1.5;
  //         }

  //         .company-info {
  //           margin-top: 20px;
  //           padding-top: 20px;
  //           border-top: 1px solid #e0e0e0;
  //           font-size: 0.8rem;
  //           color: #999;
  //         }

  //         @media print {
  //           body {
  //             background: white;
  //             padding: 0;
  //           }

  //           .invoice-container {
  //             box-shadow: none;
  //             border: none;
  //             border-radius: 0;
  //             max-width: none;
  //           }

  //           @page {
  //             margin: 15mm;
  //             size: A4;
  //           }
  //         }

  //         @media (max-width: 768px) {
  //           body {
  //             padding: 10px;
  //           }

  //           .header {
  //             padding: 30px 20px 20px;
  //           }

  //           .invoice-title {
  //             font-size: 2.2rem;
  //             margin-bottom: 20px;
  //           }

  //           .invoice-details {
  //             grid-template-columns: repeat(2, 1fr);
  //             gap: 20px;
  //           }

  //           .content {
  //             padding: 30px 20px;
  //           }

  //           .billing-section {
  //             grid-template-columns: 1fr;
  //             gap: 30px;
  //           }

  //           .items-table th,
  //           .items-table td {
  //             padding: 10px 8px;
  //             font-size: 0.8rem;
  //           }

  //           .totals-table {
  //             max-width: 280px;
  //           }
  //         }

  //         @media (max-width: 480px) {
  //           .invoice-details {
  //             grid-template-columns: 1fr;
  //             gap: 15px;
  //           }

  //           .detail-item {
  //             text-align: center;
  //             padding: 10px 0;
  //           }

  //           .items-table th:nth-child(3),
  //           .items-table td:nth-child(3) {
  //             display: none;
  //           }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="invoice-container">
  //         <div class="header">
  //           <div class="invoice-title">Invoice</div>
  //           <div class="invoice-details">
  //             <div class="detail-item">
  //               <div class="detail-label">N. Invoice</div>
  //               <div class="detail-value">${order.OrderID}</div>
  //             </div>
  //             <div class="detail-item">
  //               <div class="detail-label">Date</div>
  //               <div class="detail-value">${orderDate}</div>
  //             </div>
  //             <div class="detail-item">
  //               <div class="detail-label">Payment Method</div>
  //               <div class="detail-value">${order.PaymentStatus || 'CREDIT CARD'}</div>
  //             </div>
  //             <div class="detail-item">
  //               <div class="detail-label">Amount Due</div>
  //               <div class="detail-value">$${order.TotalAmount?.toLocaleString() || '0'}</div>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="content">
  //           <div class="billing-section">
  //             <div class="billing-block">
  //               <h3>Bill To:</h3>
  //               <p><strong>CUSTOMER NAME</strong></p>
  //               <p>Customer Address Line 1</p>
  //               <p>Customer Address Line 2</p>
  //               <p>Phone Number</p>
  //               <p>customer@email.com</p>
  //             </div>
  //             <div class="billing-block">
  //               <h3>Bill From:</h3>
  //               <p><strong>ASHOKA RUBBER INDUSTRIES</strong></p>
  //               <p>No. 89, Ruwanpura, Hapugasthalawa</p>
  //               <p>Tel: 0776 272 994, 0779 626 642</p>
  //               <p>info@ashokarubber.com</p>
  //             </div>
  //           </div>

  //           <table class="items-table">
  //             <thead>
  //               <tr>
  //                 <th>Items</th>
  //                 <th>Quantity</th>
  //                 <th>Price</th>
  //                 <th>Total Amount</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               ${orderRows}
  //             </tbody>
  //           </table>

  //           <div class="totals-section">
  //             <table class="totals-table">
  //               <tr>
  //                 <td>Subtotal</td>
  //                 <td>$${subtotal.toLocaleString()}</td>
  //               </tr>
  //               <tr>
  //                 <td>Tax (10%)</td>
  //                 <td>$${(subtotal * 0.1).toLocaleString()}</td>
  //               </tr>
  //               <tr class="total-row">
  //                 <td>Total</td>
  //                 <td>$${order.TotalAmount?.toLocaleString() || (subtotal * 1.1).toLocaleString()}</td>
  //               </tr>
  //             </table>
  //           </div>
  //         </div>

  //         <div class="footer">
  //           <h3>Thank You!</h3>
  //           <p>The star charts represent the position of the stars as we see them from Earth; however, the stars in each</p>
  //           <p>constellation may not be close to each other, as some we perceive to be brighter</p>
  //           <div class="company-info">
  //             Software by: Hexalyte Technology LTD
  //           </div>
  //         </div>
  //       </div>

  //       <script>
  //         window.onload = function() {
  //           setTimeout(() => {
  //             window.print();
  //             window.onafterprint = function() {
  //               window.close();
  //             };
  //           }, 300);
  //         };
  //       </script>
  //     </body>
  //     </html>
  //   `;

  //   printWindow.document.write(printContent);
  //   printWindow.document.close();
  // };

  const printOrder = async (order) => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const orderDate = new Date(order.OrderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const api = createAxiosInstance()
    const orderItemsRes = await api.get(`salesorderdetails/${order.OrderID}`) || []

    const orderItems = orderItemsRes.data.data || []

    const orderRows = orderItems.map((orderItem) => {

      return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${orderItem.ProductId}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderItem.product.Name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderItem.Quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${Number(orderItem.UnitPrice)?.toLocaleString() || '0'} LKR</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${((Number(orderItem.UnitPrice)) * Number(orderItem.Quantity))?.toLocaleString() || '0'} LKR</td>
          </tr>
        `

    }).join('')


    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Order #${order.OrderID}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 15px;
              color: #333;
              line-height: 1.4;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              padding: 15px;
              border-radius: 4px;
              box-shadow: 0 1px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2d5a27;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .document-title {
              font-size: 24px;
              font-weight: bold;
              color: #2d5a27;
              margin-bottom: 5px;
              letter-spacing: 1px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 3px;
            }
            .company-details {
              font-size: 10px;
              color: #374151;
              margin-bottom: 3px;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              background: #f8f9fa;
              padding: 12px;
              border-radius: 4px;
            }
            .order-details {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .order-number {
              font-size: 14px;
              font-weight: bold;
              color: #1f2937;
            }
            .order-date {
              color: #6b7280;
              font-size: 12px;
            }
            .payment-method {
              color: #6b7280;
              font-size: 12px;
            }
            .amount-due {
              text-align: right;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 3px;
            }
            .amount-label {
              font-size: 12px;
              color: #6b7280;
              font-weight: 600;
            }
            .amount-value {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
            }
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .billing-info {
              flex: 1;
            }
            .billing-title {
              font-weight: bold;
              font-size: 14px;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .billing-details {
              font-size: 12px;
              color: #4b5563;
              line-height: 1.4;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              background: white;
              border-radius: 4px;
              overflow: hidden;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .items-table th {
              background: #f8f9fa;
              padding: 8px 6px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
            }
            .items-table td {
              padding: 6px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 12px;
            }
            .items-table tr:last-child td {
              border-bottom: none;
            }
            .items-table tr:hover {
              background: #f9fafb;
            }
            .quantity-cell {
              text-align: center;
              font-weight: 600;
            }
            .price-cell {
              text-align: right;
              font-weight: 600;
            }
            .total-cell {
              text-align: right;
              font-weight: bold;
              color: #1e40af;
            }
            .totals-section {
              margin-left: auto;
              width: 250px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 12px;
            }
            .total-row.subtotal {
              color: #6b7280;
            }
            .total-row.tax {
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
              margin-bottom: 6px;
            }
            .total-row.final {
              font-size: 14px;
              font-weight: bold;
              color: #1f2937;
              border-top: 1px solid #1f2937;
              padding-top: 6px;
            }
            .status-badge {
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              display: inline-block;
            }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-unpaid { background: #fee2e2; color: #991b1b; }
            .thank-you {
              text-align: center;
              margin-top: 20px;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .thank-you-title {
              font-size: 18px;
              font-weight: bold;
              color: #2d5a27;
              margin-bottom: 5px;
            }
            .thank-you-message {
              font-size: 11px;
              color: #6b7280;
              line-height: 1.4;
            }
            .footer {
              margin-top: 15px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
              text-align: center;
              color: #6b7280;
              font-size: 10px;
            }
            .print-date {
              text-align: right;
              font-size: 10px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            @media print {
              body { 
                margin: 10px;
                background: white;
              }
              .container {
                box-shadow: none;
                padding: 0;
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="print-date">Printed on: ${currentDate}</div>
            
            <div class="header">
              <div class="document-title">SALES ORDER</div>
              <div class="company-name">Ashoka Rubber Industries</div>
              <div class="company-details"><strong>DEALERS IN RADIATOR HOSE, AIR CLEANER HOSE, OIL HOSE AND POWER STEERING HOSE</strong></div>
              <div class="company-details">No. 89, Ruwanpura, Hapugasthalawa, Tel: 0776 272 994, 0779 626 642</div>
            </div>
  
            <div class="order-header">
              <div class="order-details">
                <div class="order-number">PURCHASE ORDER: #${order.OrderID}</div>
                <div class="order-date">DATE: ${orderDate}</div>
              </div>
              <div class="amount-due">
                <div class="amount-label">AMOUNT DUE</div>
                <div class="amount-value">${Number(order.TotalAmount)?.toLocaleString() || '0'} LKR</div>
              </div>
            </div>
  
  
  
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${orderRows}
              </tbody>
            </table>
  
            <div class="totals-section">
              <div class="total-row subtotal">
                <span>SUBTOTAL</span>
                <span>${Number(order.SubTotal || order.TotalAmount)?.toLocaleString() || '0'} LKR</span>
              </div>
              <div class="total-row final">
                <span>TOTAL</span>
                <span>${Number(order.TotalAmount)?.toLocaleString() || '0'} LKR</span>
              </div>
            </div>
  
            <div class="thank-you">
              <div class="thank-you-title">THANK YOU!</div>
              <div class="thank-you-message">
                Thank you for your business. We appreciate your trust in our quality rubber products and look forward to serving you again.
              </div>
            </div>
  
            <div class="footer">
              <p>This is a computer-generated document. No signature is required.</p>
              <p>Purchase Order #${order.OrderID} | Generated on ${currentDate}</p>
              <p>Payment Status: <span class="status-badge status-${order.Status?.toLowerCase() || 'unpaid'}">${order.Status || 'Unpaid'}</span></p>
            </div>
          </div>
  
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  function deleteSalesOrder() {
    // Function implementation
  }

  async function loadSalesOrders() {

    // if (checkToken()) {
    try {
      setIsLoading(true);
      // const response = await axios.get(`${BASE_URL}salesorder`, {headers:{ Authorization: `Bearer ${TOKEN}` }});

      const api = createAxiosInstance()
      const response = await api.get('salesorder')

      if (response.status === 200) {
        setSalesOrders(() => response.data.salesorders);
      }
      setIsLoading(false);
    } catch (error) {
      // if (error.status === 500 && error.response?.data?.error.includes("Please authenticate")) {
      //   localStorage.clear();
      //   history.push('/auth/login');
      // }
      if (error.status === 404 && error.response.data.message === "no sales orders found") {
        console.log("No Sales Orders Found")
      } else {
        console.log(error)
      }
      setIsLoading(false);
    }

    // } else {
    //   history.push('/auth/login');
    // }

  }

  async function updatePaymentStatus(order) {
    try {
      const result = await Swal.fire({
        title: "Update Payment Status",
        text: `Mark this order as Paid?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#74BF04",
        cancelButtonColor: "#6b7280",
        confirmButtonText: `Yes, mark as Paid`,
      });

      if (result.isConfirmed) {

        const newStatus = {
          CustomerID: order.CustomerID,
          OrderDate: order.OrderDate,
          TotalAmount: order.TotalAmount,
          Discount: order.Discount,
          DiscountID: order.DiscountID,
          Status: order.Status,
          LocationID: order.LocationID,
          PaymentStatus: 'PAID',
        }

        // const updateReq = await axios.put(
        //   `${BASE_URL}salesorder/${order.OrderID}`,
        //   newStatus,
        //   {headers:{ Authorization: `Bearer ${TOKEN}` }}
        // );

        const api = createAxiosInstance();
        const updateReq = await api.put(`salesorder/${order.OrderID}`, newStatus)

        // console.log(updateReq)

        if (updateReq.status === 200) {
          loadSalesOrders()

          Swal.fire({
            title: "Updated!",
            text: `Payment status has been updated to Paid.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update payment status. Please try again.",
        icon: "error",
      });
    }
  }

  // Filter orders based on search query
  // const filteredOrders = salesOrders.filter(order => {

  //   return (
  //     order.OrderID.toString().includes(searchQuery) ||
  //     (order.Status && order.Status.toLowerCase().includes(searchQuery.toLowerCase())) ||
  //     (new Date(order.OrderDate) === (new Date(date)))
  //   )

  // }
  // );

  const filteredOrders = salesOrders.filter(order => {
    // Search query filter (Order ID or Status)
    const matchesSearch = !searchQuery ||
      order.OrderID.toString().includes(searchQuery) ||
      (order.Status && order.Status.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filter
    const matchesDate = !date ||
      new Date(order.OrderDate).toDateString() === new Date(date).toDateString();

    return matchesSearch && matchesDate;
  });

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderRadius: "8px 8px 0 0",
        border: "none",
        minHeight: "56px",
      },
    },
    headCells: {
      style: {
        color: "#4b5563",
        fontSize: "14px",
        fontWeight: "600",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        minHeight: "60px",
        borderBottom: "1px solid #f3f4f6",
        "&:last-of-type": {
          borderBottom: "none",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f3f4f6",
        cursor: "pointer",
        transitionDuration: "0.15s",
        transitionProperty: "background-color",
        borderBottomColor: "#f3f4f6",
        outlineColor: "transparent",
      },
    },
    pagination: {
      style: {
        border: "none",
        backgroundColor: "#fff",
        borderRadius: "0 0 8px 8px",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  };

  const StatusBadge = ({ status }) => {
    let badgeClass = "px-3 py-1 rounded-full text-xs font-medium ";

    if (status.toLowerCase() === "completed") {
      badgeClass += "bg-green-100 text-green-800";
    } else if (status.toLowerCase() === "pending") {
      badgeClass += "bg-yellow-100 text-yellow-800";
    } else if (status.toLowerCase() === "cancelled") {
      badgeClass += "bg-red-100 text-red-800";
    } else {
      badgeClass += "bg-blue-100 text-blue-800";
    }

    return <span className={badgeClass}>{status}</span>;
  };

  const columns = [
    {
      name: "Order ID",
      selector: row => row.OrderID,
      sortable: true,
      style: {
        fontWeight: 600,
        color: "#1f2937",
      },
    },
    {
      name: "Order Date",
      selector: row => {
        const date = new Date(row.OrderDate);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      sortable: true,
      style: {
        color: "#6b7280",
      },
    },
    {
      name: "Total Amount",
      selector: row => {
        return (
          <span className="font-semibold text-gray-800">
            {row.TotalAmount.toLocaleString()} LKR
          </span>
        );
      },
      sortable: true,
      style: {
        color: "#374151",
      },
    },
    {
      name: "Status",
      selector: row => <StatusBadge status={row.Status} />,
      sortable: true,
    },
    {
      name: "Payment Status",
      selector: row => <PaymentActionButton order={row} updatePaymentStatus={updatePaymentStatus} orderType="SalesOrder" />,
      sortable: true,
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            // onClick={() => printHandler()}
            onClick={() => handlePrint(row)}
            title="Print Receipt"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              printOrder(row);
            }}
            title="Print Order"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            className="bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
            onClick={() => setOpenSalesOrderDetailModal(row)}
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
      button: `true`,
      width: "120px",
    }
  ];

  useEffect(() => {

    loadSalesOrders();
    return () => { };

  }, []);


  return (
    <>
      <div className="w-full min-h-screen p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all sales orders in one place
              </p>
            </div>
            <button
              onClick={() => setOpenAddSalesOrderModal(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Sales Order
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search orders by ID or status"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={loadSalesOrders}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(() => e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-auto sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search orders by ID or status"
                />
              </div>
              <div className="flex flex-grow space-x-2">
                <button
                  onClick={() => handlePrintSalesOrderTable(filteredOrders)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Table
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable
              className="rdt_Table"
              columns={columns}
              data={filteredOrders}
              customStyles={customStyles}
              highlightOnHover
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
              progressPending={isLoading}
              progressComponent={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
              noDataComponent={
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-lg font-medium text-gray-500">No orders found</p>
                  <p className="mt-1 text-sm text-gray-400">Try adjusting your search or create a new order</p>
                </div>
              }
            />
          </div>

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">{salesOrders.length}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {salesOrders.filter(order => order.Status?.toLowerCase() === "completed").length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {salesOrders.filter(order => order.Status?.toLowerCase() === "pending").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openAddSalesOrderModal && (
        <SalesOrderAddModal
          setOpenAddSalesOrderModal={setOpenAddSalesOrderModal}
          loadSalesOrders={loadSalesOrders}
        />
      )}

      {openSalesOrderDetailModal && (
        <SalesOrderInfoModal
          setOpenSalesOrderDetailModal={setOpenSalesOrderDetailModal}
          orderInfo={openSalesOrderDetailModal}
          pdfPrint={printOrder}
          thermalPrint={handlePrint}
        />
      )}
    </>
  );
}

export default SalesOrders;