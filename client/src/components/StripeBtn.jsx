import React from "react";

export const StripeBtn = () => {
  const stripeHandler = async () => {
    try {
      const res = fetch("/api/stripe", {
        method: "POST",
        body: JSON.stringify({ prodId: 4, quantity: 1 }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={stripeHandler}>Stripe</button>;
};
