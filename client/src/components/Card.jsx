import React from "react";
import { Paypal } from "./Paypal";
import { PaytmBtn } from "./PaytmBtn";
import { RazorpayBtn } from "./Razorpay";
import { StripeBtn } from "./StripeBtn";

export const Card = () => {
  return (
    <div className="container">
      <div className="card">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8c2hvZXMlMjBuaWtlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          alt=""
        />
        <div className="card-body">
          <div className="row">
            <div className="card-title">
              <h4>Nike Sneaker</h4>
              <h3>&#8377; 500</h3>
            </div>
          </div>
          <hr />
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi, dignissimos.</p>
          <div className="btn-group">
            <div className="btn">
              {/* <a href="">Buy Now</a> */}
              <RazorpayBtn />
            </div>
            <div className="btn">
              <StripeBtn />
            </div>
            <div className="btn">
              <PaytmBtn />
            </div>
            <div className="btn">
              <Paypal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
