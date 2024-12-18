// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


export async function POST(request) {
    let requestData = await request.json();
console.log("requestdata", requestData)
    const { amount } = requestData;
    const numericAmount = Math.round(parseFloat(amount) * 100);

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount:numericAmount,
    currency: "pkr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });
  return new Response(JSON.stringify({   clientSecret: paymentIntent.client_secret,
    // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`}), {
    status: 200,
  });

};


