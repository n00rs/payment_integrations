const router = require("express").Router();
const Razorpay = require("razorpay");
const { createHmac } = require("crypto");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = process.env;

const products = [
  { id: 1, name: "addidas", price: 200 },
  { id: 3, name: "nike", price: 500 },
  { id: 2, name: "tommy", price: 700 },
  { id: 4, name: "rebook", price: 900 },
];

const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET });

router.post("/orders", async (req, res, next) => {
  try {
    const { prodId, quantity } = req.body;

    const product = products.find((prod) => prod.id === prodId);

    let total = product.price * parseInt(quantity ? quantity : 1);

    const receipt = `reciept_no ${Math.random().toFixed(6).slice(-6)}`,
      options = {
        amount: total * 100,
        currency: "INR",
        receipt,
      },
      order = await instance.orders.create(options);
    if (!order) throw { message: "error in creating order razorpay" };

    console.log(order);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

router.post("/success", async (req, res, next) => {
  try {
    console.log(req.body);

    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const hmac = createHmac("sha256", RAZORPAY_SECRET);

    hmac.update(`${orderId}|${razorpayPaymentId}`);

    const digest = hmac.digest("hex");

    console.log(digest);

    if (digest !== razorpaySignature) throw { message: "signature doesnt match" };

    // db.orderCollecttion.updateOne({ _id:orderId  } {$set:{orderStatus:'payment received'}})    //update the ordrStatus

    res.status(200).json({ message: "success", orderId, razorpayPaymentId });
  } catch (err) {
    next(err);
  }
});

router.get("/payment-details/:paymentId", async (req, res, next) => {
  const { paymentId } = req.params;
  // const paymentData = await instance.payments.all(); /// to fetch all details
  const paymentData = await instance.payments.fetch(paymentId);
  res.status(200).json(paymentData);
});

module.exports = router;

// razorpayPaymentId: 'pay_KkKvoFqjm4nJIR',
// razorpayOrderId: 'order_KkKv53jggPrGq3',
