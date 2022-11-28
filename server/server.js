const express = require("express");
const CurrencyConverter = require("./utils/currencyConverter");

const app = express();

const env = require("dotenv").config();
const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/razorpay", require("./routes/razorpayRoutes"));
app.use("/api/paypal", require("./routes/paypalRoutes"));

// app.get('/',async(req,res,next)=>{
//   try {
//     const a =await CurrencyConverter.convert(500)
//     res.json(a)
//   } catch (err) {
//     next(err)
//   }
// })

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json(err.message);
});

app.listen(PORT, () => console.log(`server up at ${PORT}`));
