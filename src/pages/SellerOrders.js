import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './SellerOrders.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStatus, setViewStatus] = useState('pending');
  const [selectedItems, setSelectedItems] = useState(null);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchOrders();
  }, [viewStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get seller user:', userError);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('orders')
      .select('id, code, user_id, address, total, status, items, profiles: profiles (first_name, last_name)')
      .eq('status', viewStatus);

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'accepted' })
      .eq('id', orderId);
  
    if (error) {
      console.error('Error updating order:', error);
    } else {
      // Refresh the list manually to reflect the change
      fetchOrders();
    }
  };
  

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.profiles?.first_name ?? ''} ${order.profiles?.last_name ?? ''}`;
    const code = order.code ?? '';
    const address = order.address ?? '';
    const query = searchQuery.toLowerCase();

    return (
      fullName.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="seller-orders-container">
      <h2>Order</h2>
      <div className="orders-topbar">
        <div className="status-toggle">
          <button className={viewStatus === 'pending' ? 'active' : ''} onClick={() => setViewStatus('pending')}>
            Pending
          </button>
          <button className={viewStatus === 'accepted' ? 'active' : ''} onClick={() => setViewStatus('accepted')}>
            Accepted
          </button>
        </div>
        <input
          className="search-bar"
          placeholder="Search by name, address, or code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>🧾</td>
                <td>{order.code || order.id}</td>
                <td>{order.profiles?.first_name} {order.profiles?.last_name}</td>
                <td>{order.address}</td>
                <td>₱{order.total}</td>
                <td style={{ perspective: 600 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {order.status === 'accepted' || acceptedOrders.includes(order.id) ? (
                      <motion.button
                        key="view"
                        className="view-btn"
                        onClick={() => navigate(`/seller-order-detail/${order.id}`)}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        View Order
                      </motion.button>
                    ) : (
                      <motion.button
                        key="accept"
                        className="accept-btn"
                        onClick={() => handleAccept(order.id)}
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        Accept
                      </motion.button>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedItems && (
        <div className="items-modal-backdrop" onClick={() => setSelectedItems(null)}>
          <div className="items-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🧾 Order Items</h3>
            <ul>
              {selectedItems.map((item, i) => (
                <li key={i}>
                  {item.name} — ₱{item.price} × {item.quantity}
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setSelectedItems(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
