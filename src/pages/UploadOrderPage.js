import React, { useState } from 'react';
import './UploadOrderPage.css';
import { supabase } from '../supabaseClient';

function UploadOrderPage({ onCancel }) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async () => {
    if (!imageFile) return null;
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
    if (error) {
      alert('Image upload failed: ' + error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (isPublish) => {
    if (!productName || !productPrice || !productQuantity || !imageFile) {
      alert("Please complete all required fields including image upload.");
      return;
    }
  
    if (productPrice <= 0 || productQuantity < 0) {
      alert("Price must be more than ₱0 and quantity cannot be negative.");
      return;
    }
  
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("❌ Not logged in or failed to fetch user.");
      return;
    }
  
    const imageUrl = await uploadImageToStorage();
    if (!imageUrl) return;
  
    const { error } = await supabase.from('products').insert([
      {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        quantity: parseInt(productQuantity),
        image_url: imageUrl,
        is_sold_out: !isPublish, // ✅ Add this line
      },
    ]);
  
    if (error) {
      alert('❌ Product insert failed: ' + error.message);
      console.error('Insert failed:', error);
    } else {
      alert('✅ Product successfully uploaded!');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductQuantity('');
      setImageFile(null);
      setImagePreview(null);
      onCancel();
    }
  };
  

  return (
    <div className="upload-container">
      <h2 className="upload-title">Basic information</h2>

      <div className="form-group image-upload">
        <label className="form-label">Product image</label>
        <div className="image-box" onClick={() => document.getElementById('imageInput').click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          ) : (
            <span className="plus-icon">+</span>
          )}
        </div>
        <input
          type="file"
          id="imageInput"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Product name</label>
        <input
          type="text"
          className="input-field"
          maxLength={100}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <div className="char-counter">{productName.length}/100</div>
      </div>

      <div className="form-group">
        <label className="form-label">Product description</label>
        <textarea
          className="textarea-field"
          rows="5"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Price (₱)</label>
        <input
          type="number"
          className="input-field"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          className="input-field"
          value={productQuantity}
          onChange={(e) => setProductQuantity(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button className="btn cancel" onClick={onCancel}>Cancel</button>
        <button className="btn publish" onClick={() => handleSubmit(true)}>Save and Publish</button>
      </div>
    </div>
  );
}

export default UploadOrderPage;