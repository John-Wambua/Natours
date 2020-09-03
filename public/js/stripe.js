import axios from 'axios';
import { showAlert } from './alerts';

const stripe=Stripe('pk_test_51H8Sr9Hl9RpwDW9LKHD27Ph6dJ7ebs7QQBd8jeHs3YEXsyc2LQsDAEQZL6SSRyCE1eIbvg0px3LcotM8ISrvcNbW00kLS6FgSc')

export const bookTour=async (tourId)=>{
  // 1) Get checkout session from API
  try {
    const res = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`)
    if (res.data.status==='success'){
      console.log(res.data.session.id);
      // 2) Create checkout form + charge credit cart

      await stripe.redirectToCheckout({
        sessionId:res.data.session.id
      })
    }

  }catch (e) {
    console.log(e);
    showAlert('error',e.data.message)
  }

}