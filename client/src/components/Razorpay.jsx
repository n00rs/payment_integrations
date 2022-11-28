import React from "react";

export const RazorpayBtn = () => {
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = (e) => {
        console.log(e);
        reject("err in script");
      };
      document.body.append(script);
    });
  };

  const popupRazor = async () => {
    try {
      const script = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (script) {
        const res = await fetch("/api/razorpay/orders", { method: "POST" });
        const resData = await res.json();
        if (!res.ok) throw resData;
        console.log(resData);

        const { amount, id: orderId, currency } = resData;
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "alchemist",
          description: "testing",
          order_id: orderId,
          handler: async (res) => {
            console.log(res, "handler");

            const data = {
              orderId,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpayOrderId: res.razorpay_order_id,
              razorpaySignature: res.razorpay_signature,
            };

            const response = await fetch("/api/razorpay/success", {
              method: "POST",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
            });

            const resData = await response.json();
            if (!res.ok) throw resData;

            console.log(resData);
          },
          prefill: {
            name: "jon doe",
            email: "jondoe@gmail.com",
            phone: "+911001001001",
          },
          notes: {
            address: "jony boy , baker street 521 , london-53211 ",
          },
          theme: {
            color: "#61dafb",
          },
        };
        
        const paymentObj = new window.Razorpay(options);
        paymentObj.on("payment.failed", function (response) {
          console.log(response);
          alert(response.error.description);
          alert(response.error.reason);
        });
        paymentObj.open();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={popupRazor}>Razorpay &#8377; 500</button>;
};
