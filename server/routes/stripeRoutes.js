const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const products = [
  { id: 1, name: "addidas", price: 200 },
  { id: 3, name: "nike", price: 400 },
  { id: 2, name: "tommy", price: 700 },
  { id: 4, name: "rebook", price: 500 },
];

router.post("/order", async (req, res, next) => {
  try {
    const { prodId, quantity } = req.body;

    const product = products.find((prod) => prod.id === prodId);

    let total = product.price * parseInt(quantity ? quantity : 1);

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.HOSTED_URL}/order/success`,
      cancel_url: `${process.env.HOSTED_URL}/order/failed`,
      mode: `payment`,
      payment_method_types: [`card`],
      client_reference_id: "unique_orderId",
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: total * 100,
            product_data: {
              name: "grand total",
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        receipt_email: "address@c.email",
        metadata: {
          orderId: "unique_orderId",
        },
      },
    });

    if (session.url) res.status(200).json(session.url);
    else throw new Error("opps something went wrong ");
  } catch (err) {
    next(err);
  }
});

router.post("/webhooks", express.raw({ type: "application/json" }), async (req, res, next) => {
  //web hooks to verify the payment success
  const payload = req.body;
  const payloadString = JSON.stringify(payload);
  const header = stripe.webhooks.generateTestHeaderString({
    //                                                                                                       <= got from google
    payload: payloadString,
    secret: process.env.SIGNIN_SECRET_KEY, //sign in key from stripe CLI
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(payloadString, header, process.env.SIGNIN_SECRET_KEY);
    console.log("Webhook Verified:", event);
  } catch (err) {
    next(err);
  }
  switch (event.type) {
    case "checkout.session.completed":
      {
        const paymentData = event.data.object;
        if (paymentData.payment_status === "paid") {
          console.log("payment success "); // code to execute after the payment is success
        }
      }
      break;

    case "checkout.session.async_payment_failed":
      const paymentData = event.data.object;
      if (!paymentData.paid) {
        console.log(`payment is failed code to execute after the payment is failed`);
      }
      break;
    case "charge.succeeded": // only to get the payment recipt
      let transcationId = event.data.object.id;
      let receipt = event.data.object.receipt_url;
      console.log(`trannscation id: ${transcationId} , receipt: ${receipt}`);

      break;

    default:
      break;
  }

  res.json({
    success: true,
  });
});

module.exports = router;
