import React, { useEffect, useState } from 'react';
import './SellerDashboard.css';
import { supabase } from '../supabaseClient';

function SalesReport() {
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
        .from('order_items')
        .select('order_id, name, price, quantity, orders(created_at, seller_id)')
        .eq('orders.seller_id', user.id);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      // Aggregate by product name + price
      const grouped = {};
      data.forEach((item) => {
        const key = `${item.name}_${item.price}`;
        if (!grouped[key]) {
          grouped[key] = {
            product: item.name,
            date: item.orders?.created_at?.split('T')[0] || '-',
            cost: item.price,
            orders: item.quantity,
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
      <h2 className="section-title">AUDIT <span className="highlight">SALES</span></h2>
      <table className="sales-report-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Date</th>
            <th>Cost</th>
            <th>Orders</th>
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
              <td>{calculateTotalSales(row.cost, row.orders).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesReport;
