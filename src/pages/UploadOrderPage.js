import React, { useState , useEffect } from 'react';
import './UploadOrderPage.css';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

function UploadOrderPage({ onCancel }) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sellerName, setSellerName] = useState('');
  

    useEffect(() => {
      const fetchSellerName = async () => {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();
    
        if (authError || !user) {
          console.error('Auth error:', authError?.message || 'No user found');
          return;
        }
    
        const { data, error } = await supabase
          .from('sellers')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
    
        if (error) {
          console.error('Error fetching seller name:', error.message);
        } else {
          setSellerName(`${data.first_name}` .replace(/\b\w/g, char => char.toUpperCase()));
        }
      };
    
      fetchSellerName();
    }, []);

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
    Swal.fire('Upload Error', 'Image upload failed: ' + error.message, 'error');
    return null;
  }
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
};

const handleSubmit = async (isPublish) => {
  if (!productName || !productPrice || !productQuantity || !imageFile) {
    return Swal.fire('Missing Fields', 'Please complete all required fields including image upload.', 'warning');
  }

  if (productPrice <= 0 || productQuantity < 0) {
    return Swal.fire('Invalid Values', 'Price must be more than ₱0 and quantity cannot be negative.', 'warning');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Swal.fire('User Error', '❌ Not logged in or failed to fetch user.', 'error');
  }

  const imageUrl = await uploadImageToStorage();
  if (!imageUrl) return;

  const { error } = await supabase.from('products').insert([{
    name: productName, //vape number 1
    description: productDescription, //isang hipak sakit agad
    price: parseFloat(productPrice), //100
    quantity: parseInt(productQuantity), //100
    image_url: imageUrl,
    is_sold_out: !isPublish,
  }]);

  if (error) {
    console.error('Insert failed:', error);
    return Swal.fire('Insert Error', '❌ Product insert failed: ' + error.message, 'error');
  }

  Swal.fire('Success', '✅ Product successfully uploaded!', 'success');
  setProductName('');
  setProductDescription('');
  setProductPrice('');
  setProductQuantity('');
  setImageFile(null);
  setImagePreview(null);
  onCancel();
};

  

  return (
    <div className="upload-container">
                  <header className="dashboard-header">
              <div className="user-info">
              <span className="username">Seller: <b>{sellerName || 'Seller'}</b> </span>
                
              </div>
            </header>
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
        <button className="btn publish" onClick={() => handleSubmit(true)}>Save and Publish</button>
      </div>
    </div>
  );
}

export default UploadOrderPage;