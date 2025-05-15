import React, { useState } from 'react';
import './RefundPage.css';

function RefundPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    requestDate: '',
    reason: '',
    specifyReason: '',
    productName: '',
    productId: '',
    purchaseDate: '',
    proofFile: null,
    notes: '',
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === 'checkbox' ? checked : type === 'file' ? files[0] : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert('You must agree to the terms before submitting.');
      return;
    }
    console.log('Refund request submitted:', formData);
    // Handle form submission logic here (e.g., API call)
  };

  return (
    <div className="refund-wrapper">
    <div className="refund-container">
      <h2 className="refund-title">Refund Request Form</h2>
      <form className="refund-form" onSubmit={handleSubmit}>
        <div className="input-group double">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Second Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="example@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="requestDate"
          value={formData.requestDate}
          onChange={handleChange}
          required
        />

        <fieldset className="reason-box">
          <legend>Reason for Refund:</legend>
          {['Product is Defective/Damaged', 'Wrong product received', 'Failed on time Delivery', 'Change of Mind', 'Others..'].map((reason) => (
            <label key={reason}>
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={formData.reason === reason}
                onChange={handleChange}
                required
              />
              {reason}
            </label>
          ))}
          <textarea
            name="specifyReason"
            placeholder="Please Specify.."
            value={formData.specifyReason}
            onChange={handleChange}
          ></textarea>
        </fieldset>

        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="productId"
          placeholder="Product ID"
          value={formData.productId}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          name="proofFile"
          accept="image/*,application/pdf"
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Additional Notes..."
          value={formData.notes}
          onChange={handleChange}
        ></textarea>

<label className="agree-policy">
  <input
    type="checkbox"
    name="agree"
    checked={formData.agree}
    onChange={handleChange}
  />
  <span>
    By proceeding with your request, you confirm that you have read and agreed to our <a href="/refund-policy">Refund Policy</a> and <a href="/privacy-policy">Privacy Policy</a>.
  </span>
</label>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
    </div>
  );
}

export default RefundPage;