const express = require("express");

const app = express();

const env = require("dotenv").config();
const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/razorpay", require("./routes/razorpayRoutes"));

app.use((err, req, res, next) => {

console.error(err)

  const statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json(err.message);
});

app.listen(PORT, () => console.log(`server up at ${PORT}`));
