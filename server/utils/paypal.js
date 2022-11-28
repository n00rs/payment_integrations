const fetch = require("node-fetch");

// set some important variables
const { PAYPAL_CLIENT_ID, PAYPAL_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

// call the create order method
async function createOrder(amount) {
  const purchaseAmount = amount.toFixed(2);
  const accessToken = await generateAccessToken();
  // console.log(accessToken);
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: purchaseAmount,
          },
        },
      ],
    }),
  });

  return handleResponse(response);
}

// capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
}

// generate access token
async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

// generate client token
async function generateClientToken() {
  const accessToken = await generateAccessToken();
  const response = await fetch(`${base}/v1/identity/generate-token`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    },
  });
  console.log("response", response.status);
  const jsonData = await handleResponse(response);
  return jsonData.client_token;
}

async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    const data = await response.json();
    console.log(data);
    return data;
  }

  const errorMessage = await response.text();
  console.log(errorMessage);
  throw new Error(errorMessage);
}

async function fetchPayments(paymentId) {
  // try {
  const accessToken = await generateAccessToken();
  const res = await fetch(`${base}/v1/payments/capture/${paymentId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  // const

  // const data = await res.json()
  // console.log(data,'data');
  // return data
  return handleResponse(res);
  // } catch (err) {
  //   throw err
  // }
}

module.exports = { capturePayment, createOrder, generateClientToken, fetchPayments };
