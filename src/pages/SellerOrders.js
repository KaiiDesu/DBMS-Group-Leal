import React, { useEffect, useState, useMemo , useRef } from 'react';
import { supabase } from '../supabaseClient';
import './SellerOrders.css';
import { motion, AnimatePresence } from 'framer-motion';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStatus, setViewStatus] = useState('pending');
  const [selectedItems, setSelectedItems] = useState(null);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [recordedSalesIds, setRecordedSalesIds] = useState([]);

  const statusOrder = ['to ship', 'shipped', 'delivered', 'cancelled', 'refunded'];

  const viewStatusRef = useRef(viewStatus);
  useEffect(() => {
    viewStatusRef.current = viewStatus;
  }, [viewStatus]);

  const items = useMemo(() => {
    return selectedOrder ? JSON.parse(selectedOrder.items || '[]') : [];
  }, [selectedOrder]);

  const fetchAllOrders = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name)');

    if (error) {
      console.error('Error fetching orders:', error.message);
      return;
    }

    setAllOrders(data || []);
  };

  const fetchOrders = async (statusOverride) => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get seller user:', userError);
      setLoading(false);
      return;
    }

    const currentStatus = statusOverride || viewStatus;

    const { data, error } = await supabase
      .from('orders')
      .select('id, code, user_id, seller_id, address, total, status, items, payment_method, profiles: profiles (first_name, last_name, email)')
      .eq('status', currentStatus);

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(viewStatus);
    fetchAllOrders();
  }, [viewStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(viewStatusRef.current);
      fetchAllOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setCurrentStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'accepted' })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
    } else {
      fetchOrders();
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;

    const { data: user } = await supabase.auth.getUser();
    const seller_id = selectedOrder.seller_id || user?.user?.id;
    const alreadyRecorded = recordedSalesIds.includes(selectedOrder.id);

    if (newStatus === 'delivered' && !alreadyRecorded) {
      const insertData = items.map((item) => ({
        seller_id: seller_id,
        product: item.name,
        cost: item.price,
        quantity: item.quantity,
        created_at: new Date().toISOString(),
        formatted_date: new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
        payment_method: selectedOrder.payment_method || "N/A",
        sales: item.price * item.quantity,
      }));

      const { error: insertError } = await supabase
        .from('sales_report')
        .insert(insertData);

      if (insertError) {
        console.error('❌ Failed to insert into sales_report:', insertError.message);
      } else {
        await supabase
          .from('orders')
          .update({ delivered_to_sales_report: true })
          .eq('id', selectedOrder.id);
        setRecordedSalesIds([...recordedSalesIds, selectedOrder.id]);
      }
    }

    const { error: statusError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', selectedOrder.id);

    if (statusError) {
      console.error('❌ Failed to update order status:', statusError.message);
    } else {
      setCurrentStatus(newStatus);
      fetchOrders();
    }
  };

  const statusCounts = allOrders.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

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

  if (selectedOrder) {
    return (
      <div className="order-detail-container">
        <button className="back-btn" onClick={() => setSelectedOrder(null)}>← Back to Orders</button>
        <div className="status-tracker">
          {statusOrder.map((step) => (
            <div key={step} className={`step ${statusOrder.indexOf(step) <= statusOrder.indexOf(currentStatus) ? 'done' : ''}`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </div>

        <div className="info-box">
          <h3>🚚 Shipping Information</h3>
          <p><strong>VB Express</strong></p>
          <p>Parcel Delivered</p>
        </div>

        <div className="info-box">
          <h3>🏠 Delivery Address</h3>
          <p><strong>{selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name}</strong></p>
          <p>{selectedOrder.address}</p>
        </div>

        <div className="status-button">
          {statusOrder.map((status) => (
            <button
              key={status}
              className={currentStatus === status ? 'active-status' : ''}
              onClick={() => handleStatusChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {items.map((item, index) => (
          <div className="product-card" key={index}>
            <img src={item.image_url} alt={item.name} className="product-img" />
            <div className="product-details">
              <p className="product-name">{item.name}</p>
              <p className="product-price">SRP: {item.price}</p>
              <p className="product-qty">× {item.quantity}</p>
            </div>
            <div className="order-total">
              <p>Order Total</p>
              <p><strong>₱{selectedOrder.total}</strong></p>
            </div>
          </div>
        ))}

        <div className="order-id-box">
          <p><strong>Order ID</strong></p>
          <p># {selectedOrder.code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-orders-container">
      <h2>Order</h2>
      <div className="orders-topbar">
        <div className="status-toggle">
          {['pending', 'accepted', 'to ship', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => (
            <div key={status} className="status-tab-wrapper">
              <button
                className={viewStatus === status ? 'active' : ''}
                onClick={() => setViewStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
              {statusCounts[status] > 0 && (
                <span className="notif-badge">{statusCounts[status]}</span>
              )}
            </div>
          ))}
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
                <td>📋</td>
                <td>{order.code || order.id}</td>
                <td>{order.profiles?.first_name} {order.profiles?.last_name}</td>
                <td>{order.address}</td>
                <td>₱{order.total}</td>
                <td style={{ perspective: 600 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {order.status === 'pending' ? (
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
                    ) : (
                      <motion.button
                        key="view"
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        View Order
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
            <h3>📋 Order Items</h3>
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
