import { useCallback, useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export const Paypal = () => {
  const [clientId, setClientId] = useState("");

  const createClientId = useCallback(async () => {
    try {
      const res = await fetch("/api/paypal/client-token");
      const data = await res.json();

      if (!res.ok) throw data;
      setClientId(data.clientId);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    createClientId();
  }, [createClientId]);

  const createOrder = async () => {
    try {
      const body = { prodId: 4, quantity: 1 };
      const res = await fetch("/api/paypal/orders", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw data;
      return data.id;
    } catch (err) {
      console.error(err);
    }
  };

  const onApprove = async (data, actions) => {
    try {
      console.log(data);
      const res = await fetch(`/api/paypal/orders/${data.orderID}/capture`, { method: "post" });
      const resData = await res.json();
      if (!res.ok) throw resData;
      console.log("Capture result", resData, JSON.stringify(resData, null, 2));

      const transaction = resData.purchase_units[0].payments.captures[0];

      alert(`Transaction ${transaction.status}: ${transaction.id}

        See console for all available details
      `);
    } catch (err) {
      console.error(err);
    }
  };
  const options = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    "data-client-token": clientId, 
    currency: "USD",
    intent: "capture",
  };
  return (
    <PayPalScriptProvider options={options}>
      <PayPalButtons createOrder={createOrder} onApprove={onApprove} fundingSource="paypal" />
      {/* <button onApp></button> */}
    </PayPalScriptProvider>
  );
};


// export const Paypal = () => {
//   const handlePaypal = async () => {
//     try {
//       // const res = await fetch('/api/paypal/rest',{});
//       const body = { prodId: 3, quantity: 4 };

//       const res = await fetch("/api/paypal/rest", {
//         method: "POST",
//         body: JSON.stringify(body),
//         headers: { "Content-Type": "application/json" },
//       });

//       const data = await res.json();
//       if (!res.ok) throw data;
//       else {
//         for (let i = 0; i < data.links.length; i++) {
//           if (data.links[i].rel === "approval_url") {
//             window.open(data.links[i].href)
//             // res.redirect();
//           }
//         }
//       }
//       console.log(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return <button onClick={handlePaypal}>paypal</button>;
// };
