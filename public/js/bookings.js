import { showAlert } from "./alerts";

import axios from "axios";

const stripe = Stripe('pk_test_51O1pUAASx4fb5N4FraoVPbUvPAbokIliifFQXvk8sLogBoZtrQreg86IhxtHlaod4olKE4eREJR0CcO1kbQXi7eo00N5PWCsSa');

export const checkout = async function(tourId){
  try {
    const res = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
    console.log(res);

    await stripe.redirectToCheckout({
      sessionId: res.data.data.id
    })

  } catch (error) {
    showAlert('error',error)
  }
}