import React, { useState } from 'react';
import './InventoryPage.css';
import ModalUploadForm from '../components/ModalUploadForm'; // make sure this import matches your actual file

function InventoryPage() {
  const [showModal, setShowModal] = useState(false); // <-- this was missing

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Inventory</h2>

      {/* Wrapper for filters + Add Product */}
      <div className="inventory-controls">
        <div className="left-filters">
          <select><option>Category</option></select>
          <select><option>Status</option></select>
        </div>
        <button className="add-product-btn" onClick={() => setShowModal(true)}>
          + Add Product
        </button>
      </div>

      {/* Search bar under the controls */}
      <input type="text" placeholder="Search..." className="search-bar" />

      {/* Inventory Table */}
      <table className="inventory-table">
        <thead>
          <tr>
            <th></th><th>Product ID</th><th>Name</th><th>Stocks</th><th>Price</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><img src="/placeholder.jpg" alt="product" className="product-img" /></td>
            <td>1</td>
            <td>Product Name</td>
            <td>40</td>
            <td>500</td>
            <td><span className="options-icon">⋮</span></td>
          </tr>
        </tbody>
      </table>

      {/* Upload Product Modal */}
      {showModal && <ModalUploadForm onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default InventoryPage;
