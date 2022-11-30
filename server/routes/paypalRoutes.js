const router = require("express").Router();
const paypal = require("../utils/paypal");

const { configure, payment } = require("paypal-rest-sdk");
const { convert } = require("../utils/currencyConverter");
configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

const products = [
  { id: 1, name: "addidas", price: 200 },
  { id: 3, name: "nike", price: 400 },
  { id: 2, name: "tommy", price: 700 },
  { id: 4, name: "rebook", price: 500 },
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
    let total = product.price * parseInt(quantity ? quantity : 1);
    total = await convert(total);

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

    // console.log(captureData);

    const transaction = captureData.purchase_units[0].payments.captures[0];
    const orderId = captureData.purchase_units[0].reference_id;

    // db.collection.updataOne({ _id:orderID },{ $set:{ paymentStatus:'received', paymentId:transaction.id }})                UPDATE DB PAYMENT STATUS AND ORDER ID

    console.log(transaction.status, transaction.id); //todo save the id in the db with order
    res.status(200).json(captureData);
  } catch (err) {
    next(err);
  }
});

//send the caputureID to get the paymentdetails

router.get("/paymentDetails/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentData = await paypal.fetchPayments(id);
    res.status(200).json(paymentData);
  } catch (err) {
    next(err);
  }
});

router.post("/rest", async (req, res, next) => {
  try {
    console.log("rest");
    const { prodId, quantity } = req.body;

    //querying db and calculate total

    const product = products.find((prod) => prod.id === prodId);
    const total = product.price * parseInt(quantity ? quantity : 1);

    const create_payment_json = {
      intent: "ORDER",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5000/api/paypal/success",
        cancel_url: "http://localhost:3000/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: product.name,
                sku: product.id,
                price: product.price,
                currency: "USD",
                quantity: quantity,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: total,
          },
          description: "Hat for the best team ever",
        },
      ],
    };

    router.get("/success", (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      const execute_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: total,
            },
          },
        ],
      };

      payment.execute(paymentId, execute_json, (err, data) => {
        if (err) throw err;
        else {
          console.log(JSON.stringify(data));
          res.status(200).json("success");
        }
      });
    });

    payment.create(create_payment_json, (err, payment) => {
      if (err) throw err;
      else {
        res.json(payment);
      }
      // console.log(data, "data");
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
