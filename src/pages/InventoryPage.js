import React, { useState, useEffect } from 'react';
import './InventoryPage.css';
import { supabase } from '../supabaseClient';
import ProductEditPopup from './ProductEditPopup';
import Swal from 'sweetalert2';

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (id) => {
    setEditingProductId(id);
  };

const handleDeleteClick = async (id) => {
  const result = await Swal.fire({
    title: 'Delete Product?',
    text: 'Are you sure you want to delete this product?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      Swal.fire('Error', '❌ Failed to delete product: ' + error.message, 'error');
    } else {
      Swal.fire('Deleted!', '🗑️ Product deleted.', 'success');
      fetchProducts();
    }
  }
};

  const closeEditPopup = () => {
    setEditingProductId(null);
    fetchProducts();
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory</h2>
      </div>

      <div className="inventory-controls">
      <input
        type="text"
        placeholder="Search product..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
        <div className="left-filters">
          <select>
            <option>All</option>
            <option>Published</option>
            <option>Delisted</option>
          </select>
        </div>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {products
          .filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
          .map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>₱{item.price}</td>
              <td>
                {item.quantity <= 5 ? (
                  <span className="low-stock-badge">Low: {item.quantity}</span>
                ) : (
                  item.quantity
                )}
              </td>
              <td>{item.is_sold_out ? 'Delisted' : 'Published'}</td>
              <td>
                <span
                  className="action-icon"
                  role="button"
                  onClick={() => handleEditClick(item.id)}
                  title="Edit"
                >
                  ✏️
                </span>
                <span
                  className="action-icon"
                  role="button"
                  onClick={() => handleDeleteClick(item.id)}
                  title="Delete"
                  style={{ marginLeft: '10px' }}
                >
                  🗑️
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingProductId && (
        <div className="popup-overlay">
          <div className="popup-wrapper">
            <ProductEditPopup
              productId={editingProductId}
              onClose={closeEditPopup}
              onUpdated={fetchProducts}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;