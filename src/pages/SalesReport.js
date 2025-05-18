import React, { useEffect, useState } from 'react';
import './SellerDashboard.css';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function SalesReport() {

  const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    salesData.map(row => ({
      Product: row.product,
      Date: row.date,
      Cost: row.cost,
      Orders: row.orders,
      PaymentMethod: row.payment_method,
      Sales: calculateTotalSales(row.cost, row.orders),
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'Sales_Report.xlsx');
};
  const [salesData, setSalesData] = useState([]);

  const calculateTotalSales = (cost, orders) => cost * orders;

  useEffect(() => {
    const fetchSalesData = async () => {
      const {
        data: { user },
        error: sessionError
      } = await supabase.auth.getUser();

      if (!user || sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

const { data, error } = await supabase
  .from('sales_report')
  .select('*')
  .eq('seller_id', user.id);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      // Aggregate by product name + price
const grouped = {};
data.forEach((item) => {
  const key = `${item.product}_${item.cost}`;
  if (!grouped[key]) {
    grouped[key] = {
      product: item.product,
      date: item.formatted_date || '-',
      cost: item.cost,
      orders: item.quantity,
      payment_method: item.payment_method || 'N/A',
    };
  } else {
    grouped[key].orders += item.quantity;
  }
});
setSalesData(Object.values(grouped));
    };

    fetchSalesData();
  }, []);

  return (
    <div className="content-wrapper">
      <h2 className="section-title">AUDIT SALES</h2>
      <button onClick={exportToExcel}>📥 Download to Excel</button>
      <table className="sales-report-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Date</th>
            <th>Cost</th>
            <th>Orders</th>
            <th>Payment Method</th>
            <th className="highlight">Sales</th>
          </tr>
        </thead>
<tbody>
  {salesData.map((row, index) => (
    <tr key={index}>
      <td>{row.product}</td>
      <td>{row.date}</td>
      <td>{row.cost}</td>
      <td>{row.orders}</td>
      <td>{row.payment_method}</td>
      <td>{calculateTotalSales(row.cost, row.orders).toLocaleString()}</td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default SalesReport;
