const express = require("express");
const router = express.Router();
const https = require("https");
const querytring = require("querystring");
const PaytmCheckSum = require("../utils/PaytmChecksum");

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

    let paytmParams = {}; //setting data according to paytm intgeration docs
      paytmParams["MID"] = process.env.PAYTM_MERCHANT_ID,
      paytmParams["WEBSITE"] = process.env.PAYTM_WEBSITE,
      paytmParams["ORDER_ID"] = new Date().getTime() + "paytm", //orderId for each payment request should be unique
      paytmParams["CUST_ID"] = "unique_customer_Id"+Math.random(),
      paytmParams["TXN_AMOUNT"] = total.toString(),
      paytmParams["CALLBACK_URL"] = `${process.env.SERVER_URL}/api/paytm/payment_status`, //callback url for fetching transcation url
      paytmParams["EMAIL"] = "jon@email",
      paytmParams["MOBILE_NO"] = "+919633138136";

    console.log(paytmParams);
    const checksum = await PaytmCheckSum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY); //creating checksum

    if (!checksum) throw new Error("error in paytm");
    console.log(checksum, "after generate");

    paytmParams = {
      ...paytmParams,
      CHECKSUMHASH: checksum,
    };

    res.status(200).json(paytmParams);
  } catch (err) {
    next(err);
  }
});

router.post("/payment_status", (req, res) => {
  //callback url from paytm
  console.log(req.body);
  let body = querytring.parse(req.body); //somthing wrong with qs module
  body = JSON.parse(JSON.stringify(req.body)); //to check the checksum hash came frm calback url with our data

  //   var trasncData = querystring.parse(req.body) ;
  let checkSumHash = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  // console.log(checkSumHash, req.body.CHECKSUMHASH);

  let verifyCheckSum = PaytmCheckSum.verifySignature(
    body,
    process.env.PAYTM_MERCHANT_KEY,
    checkSumHash
  );
  console.log(verifyCheckSum);
  if (verifyCheckSum) {
    //after checksum verified checking the payment status

    var paytmParams = {};
    paytmParams["MID"] = process.env.PAYTM_MERCHANT_ID;
    paytmParams["ORDER_ID"] = body.ORDERID;

    PaytmCheckSum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY).then(
      (checkSum) => {
        //new checksum to get the status
        paytmParams["CHECKSUMHASH"] = checkSum;

        var post_data = JSON.stringify(paytmParams);
        var options = {
          //setting headers
          hostname: "securegw-stage.paytm.in", //in test mod
          // in Production      hostname: 'securegw.paytm.in',
          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };
        var result = "";
        let post_req = https.request(options, (response) => {
          response.on("data", (chunk) => (result += chunk)); //geting data from post request

          response.on("end", () => {
            let paymentData = JSON.parse(result);

            console.log(paymentData);

            if (paymentData.STATUS === "TXN_SUCCESS") {
              //checking the TRANSCATION STATUS

              let transactionId = paymentData.TXNID;

              let orderId = paymentData.ORDERID; //

              console.log(
                "save the transcationId in the database with order id",
                orderId,
                transactionId
              );

              res.send(`success txnId ${transactionId} orderId ${orderId} `);
            } else {
              let orderId = paymentData.ORDERID;
              console.log("send that payment failed of", orderId);

              res.send("fail");
            }
          });
        });
        post_req.write(post_data);
        post_req.end();
      }
    );
  } else {
    console.log("check sum error");
  }
});

module.exports = router;
