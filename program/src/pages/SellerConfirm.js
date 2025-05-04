import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function SellerConfirm() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeRegistration = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Unable to get user after confirmation.");
        return navigate('/seller-login');
      }

      const { data: existing, error: checkError } = await supabase
        .from('sellers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase
          .from('sellers')
          .insert([{
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || ''
          }]);

        if (insertError) {
          console.error('Insert error:', insertError.message);
        }
      }

      // ✅ Redirect back to seller-login (your goal)
      navigate('/seller-login');
    };

    completeRegistration();
  }, [navigate]);

  return <p>Verifying and completing your registration...</p>;
}

export default SellerConfirm;
