import React, { useEffect, useState } from 'react';
import './SellerDashboard.css';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

function SellerRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchRefunds = async () => {
    try {
      const {
        data: { user },
        error: sessionError
      } = await supabase.auth.getUser();

      if (!user || sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

      console.log('Seller ID:', user.id);

      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching refunds:', error);
      } else {
        console.log('Fetched refunds:', data);
        setRefunds(data);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleAction = async (id, action) => {
    const result = await Swal.fire({
      title: `${action} this refund?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Update failed:', error);
        Swal.fire('Error', 'Failed to update refund status.', 'error');
      } else {
        Swal.fire('Success', `Refund marked as ${action}.`, 'success');
        fetchRefunds();
      }
    }
  };

  const closeModal = () => setSelectedImage(null);

  return (
    <div className="content-wrapper">
      <h2 className="section-title">AUDIT REFUNDS</h2>
      {refunds.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No refund requests found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="sales-report-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Product</th>
                <th>Product ID</th>
                <th>Purchase Date</th>
                <th>Reason</th>
                <th>Proof</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r, index) => (
                <tr key={index}>
                  <td>{r.first_name || ''} {r.last_name || ''}</td>
                  <td>{r.email || '-'}</td>
                  <td>{r.product_name || '-'}</td>
                  <td>{r.product_id || '-'}</td>
                  <td>{r.purchase_date || '-'}</td>
                  <td>{r.reason || '-'}{r.specify_reason ? ` - ${r.specify_reason}` : ''}</td>
                  <td>
                    {r.proof_url ? (
                      <button onClick={() => setSelectedImage(r.proof_url)}>View</button>
                    ) : 'None'}
                  </td>
                  <td>{r.notes || '-'}</td>
                  <td>{r.status || 'Pending'}</td>
                  <td>
                    <button onClick={() => handleAction(r.id, 'Approved')}>Approve</button>
                    <button onClick={() => handleAction(r.id, 'Rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Proof" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            <button className="close-modal" onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerRefunds;
