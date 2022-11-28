const fetch = require("node-fetch");

class CurrencyConverter {
  static async convert(amount = 1) {
    const exchngeApi = "https://open.er-api.com/v6/latest/USD";
    const res = await fetch(exchngeApi);
    const data = await res.json();

    if (!res.ok) throw new Error("converter api on leave please look up");

    const USD = data?.rates?.USD;
    const INR = data?.rates?.INR;
    const convertedAmount = (USD / INR) * parseInt(amount);
    // console.log(convertedAmount);
    return convertedAmount;
  }
}

module.exports = CurrencyConverter;
