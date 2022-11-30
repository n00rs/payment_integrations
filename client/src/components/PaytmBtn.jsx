import React from "react";

export const PaytmBtn = () => {
  const paytmHandler = async () => {
    try {
      const res = await fetch("/api/paytm/order", {
        method: "POST",
        body: JSON.stringify({ prodId: 4, quantity: 1 }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      const information = {
        action: "https://securegw-stage.paytm.in/order/process",
        params: data,
      };
      post(information);
    } catch (err) {
      console.error(err);
    }
  };
  return <button onClick={paytmHandler}>PAYTM</button>;
};

function buildForm({ action, params }) {
  const form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", action);

  Object.keys(params).forEach((key) => {
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", key);
    input.setAttribute("value", params[key]);
    form.appendChild(input);
  });

  return form;
}

function post(details) {
  const form = buildForm(details);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
