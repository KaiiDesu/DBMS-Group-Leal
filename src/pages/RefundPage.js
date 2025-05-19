import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './RefundPage.css';

function RefundPage() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert('You must agree to the terms before submitting.');
      return;
    }

    const {
      firstName, lastName, email, requestDate, reason, specifyReason,
      productName, productId, purchaseDate, proofFile, notes
    } = formData;

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (!user || userError) {
      alert('User not authenticated.');
      return;
    }

    let proofUrl = '';
if (proofFile) {
  const fileExt = proofFile.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from('refunds')
    .upload(`proofs/${fileName}`, proofFile, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadErr) {
    console.error('Upload error:', uploadErr);
    alert('File upload failed: ' + uploadErr.message);
    return;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('refunds')
    .getPublicUrl(`proofs/${fileName}`);

  proofUrl = publicUrlData.publicUrl;
}

    // Check for existing refund for same email + product_id
const { data: existing, error: existingError } = await supabase
  .from('refund_requests')
  .select('id')
  .eq('email', email)
  .eq('product_id', productId)
  .in('status', ['Pending', null]);

if (existingError) {
  alert('Failed to validate request. Try again.');
  return;
}

if (existing.length > 0) {
  alert('You already submitted a refund request for this product.');
  return;
}


    const { error } = await supabase.from('refund_requests').insert([{
      first_name: firstName,
      last_name: lastName,
      email,
      request_date: requestDate,
      reason,
      specify_reason: specifyReason,
      product_name: productName,
      product_id: productId,
      purchase_date: purchaseDate,
      proof_url: proofUrl,
      notes,
      seller_id: "ae0a32a7-6fa5-48e3-8862-98fbacd3b3ef"
    }]);

    if (error) {
      alert('Failed to submit refund request.');
      console.error(error);
    } else {
      alert('Refund request submitted successfully.');
      setFormData({ ...formData, agree: false });
    }
  };

  return (
    <div className="refund-wrapper">
      <div className="refund-container">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2 className="refund-title">Refund Request Form</h2>
        <form className="refund-form" onSubmit={handleSubmit}>
          <div className="input-group double">
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Second Name" value={formData.lastName} onChange={handleChange} required />
          </div>
          <input type="email" name="email" placeholder="example@example.com" value={formData.email} onChange={handleChange} required />
          <input type="date" name="requestDate" value={formData.requestDate} onChange={handleChange} required />
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
            <textarea name="specifyReason" placeholder="Please Specify.." value={formData.specifyReason} onChange={handleChange}></textarea>
          </fieldset>
          <input type="text" name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} required />
          <input type="text" name="productId" placeholder="Product ID" value={formData.productId} onChange={handleChange} required />
          <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
          <input type="file" name="proofFile" accept="image/*,application/pdf" onChange={handleChange} />
          <textarea name="notes" placeholder="Additional Notes..." value={formData.notes} onChange={handleChange}></textarea>
          <label className="agree-policy">
            <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} />
            <span>By proceeding with your request, you confirm that you have read and agreed to our <a href="#/policy/refund">Refund Policy</a> and <a href="#/policy/privacy">Privacy Policy</a>.</span>
          </label>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default RefundPage;
