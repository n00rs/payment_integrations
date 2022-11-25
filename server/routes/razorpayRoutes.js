const router = require("express").Router();

const Razorpay = require("razorpay");

const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = process.env;

router.post("/orders", async (req, res, next) => {
  try {
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET }),
      receipt = `reciept_no ${Math.random().toFixed(6).slice(-6)}`,
      options = {
        amount: 500 * 100,
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

module.exports = router;
