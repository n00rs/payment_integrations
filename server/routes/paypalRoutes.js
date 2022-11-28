const router = require("express").Router();
const paypal = require('../utils/paypal')
const products = [
  { id: 1, name: "addidas", price: 2 },
  { id: 3, name: "nike", price: 4 },
  { id: 2, name: "tommy", price: 7 },
  { id: 4, name: "rebook", price: 5 },
];

router.get("/client-token", async (req, res, next) => {
  try {
    const clientId = await paypal.generateClientToken();
    res.status(200).json({ clientId });
  } catch (err) {
    next(err);
  }
});

router.post("/orders", async (req, res, next) => {
  try {
    const { prodId, quantity } = req.body;

    //querying db and calculate total

    const product = products.find((prod) => prod.id === prodId);
    const total = product.price * parseInt(quantity ? quantity : 1);

    const createOrder = await paypal.createOrder(total);
    res.status(200).json(createOrder);
  } catch (err) {
    next(err);
  }
});

router.post("/orders/:orderID/capture", async (req, res, next) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.status(200).json(captureData);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
