import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './RegistreeTab.css';

function RegistreeTab() {
  const [registrees, setRegistrees] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchRegistrees();
  }, []);

  const fetchRegistrees = async () => {
  const { data, error } = await supabase
    .from('registree_requests')
    .select('*')
    .eq('status', 'pending'); // only show pending users

  if (error) {
    console.error('Fetch error:', error);
  } else {
    setRegistrees(data);
  }
};


const handleDecision = async (id, decision) => {
  const selected = registrees.find(r => r.id === id);

  if (decision === 'accept') {
    const {
      id, first_name, last_name, email, phone_number,
      birthdate, gender, id_type, id_number, id_front_url, id_back_url
    } = selected;

    const { error: insertError } = await supabase.from('profiles').insert([{
      id, first_name, last_name, email, phone_number,
      birthdate, gender, id_type, id_number, id_front_url, id_back_url
    }]);

    if (insertError) {
      return alert('Error approving user: ' + insertError.message);
    }

    await supabase
      .from('registree_requests')
      .update({ status: 'approved' })
      .eq('id', id);

    await supabase.from('registree_requests').delete().eq('id', id);
  }

  if (decision === 'decline') {
    const { error: declineError } = await supabase
      .from('registree_requests')
      .update({ status: 'declined' })
      .eq('id', id);

    if (declineError) {
      return alert('Error declining user: ' + declineError.message);
    }
  }

  setRegistrees(prev => prev.filter(r => r.id !== id));
};

  return (
    <div className="registree-tab">
      <h2>Registree Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Gender</th><th>Birthdate</th>
            <th>ID Type</th><th>ID Front</th><th>ID Back</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrees.map(r => (
            <tr key={r.id}>
              <td>{r.first_name} {r.last_name}</td>
              <td>{r.email}</td>
              <td>{r.gender}</td>
              <td>{r.birthdate}</td>
              <td>{r.id_type}</td>
              <td>
                <img
                  src={r.id_front_url}
                  alt="Front ID"
                  className="id-thumbnail"
                  onClick={() => setSelectedImage(r.id_front_url)}
                />
              </td>
              <td>
                <img
                  src={r.id_back_url}
                  alt="Back ID"
                  className="id-thumbnail"
                  onClick={() => setSelectedImage(r.id_back_url)}
                />
              </td>
              <td>
                <button className="accept-btn" onClick={() => handleDecision(r.id, 'accept')}>Accept</button>
                <button className="decline-btn" onClick={() => handleDecision(r.id, 'decline')}>Decline</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div className="image-popup-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-popup-content">
            <img src={selectedImage} alt="Full View" />
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistreeTab;
