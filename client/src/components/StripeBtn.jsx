import React from "react";

export const StripeBtn = () => {
  const stripeHandler = async () => {
    try {
      const res = await fetch("/api/stripe/order", {
        method: "POST",
        body: JSON.stringify({ prodId: 4, quantity: 1 }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      window.open(data);
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={stripeHandler}>Stripe</button>;
};
