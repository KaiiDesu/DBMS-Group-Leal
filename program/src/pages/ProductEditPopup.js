import React, { useState, useEffect } from 'react';
import './UploadOrderPage.css';
import { supabase } from '../supabaseClient';

function ProductEditPopup({ productId, onClose, onUpdated }) {
  const [product, setProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (data) {
        setProduct(data);
        setImagePreview(data.image_url);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return product.image_url;
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
    if (error) {
      alert('Image upload failed: ' + error.message);
      return product.image_url;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleUpdate = async (isPublish) => {
    if (!product?.id) {
      alert('⚠️ Missing product ID. Cannot update.');
      return;
    }

    const imageUrl = await uploadImage();

    console.log('Updating product ID:', product.id);

    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        image_url: imageUrl,
        is_sold_out: !isPublish,
      })
      .eq('id', product.id)
      .select();

    if (error) {
      alert('❌ Update failed: ' + error.message);
      console.error(error);
    } else if (!data || data.length === 0) {
      alert('⚠️ No product was updated. Check if ID is correct or RLS is blocking.');
    } else {
      alert('✅ Product updated!');
      console.log('Updated product:', data[0]);
      onUpdated(); // refresh list
      onClose();   // close popup
    }
  };

  if (!product) return null;

  return (
    <div className="upload-container">
      <h2 className="upload-title">Edit Product</h2>

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
          value={product.name || ''}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />
        <div className="char-counter">{(product.name || '').length}/100</div>
      </div>

      <div className="form-group">
        <label className="form-label">Product Description</label>
        <textarea
          className="textarea-field"
          rows="5"
          value={product.description || ''}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="input-field"
          value={product.price || ''}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          className="input-field"
          value={product.quantity || ''}
          onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
        />
      </div>

      <div className="button-group">
        <button className="btn cancel" onClick={onClose}>Cancel</button>
        <button className="btn publish" onClick={() => handleUpdate(true)}>Save and Publish</button>
      </div>
    </div>
  );
}

export default ProductEditPopup;
