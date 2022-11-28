import "./App.css";
import { Paypal } from "./components/Paypal";
import { RazorpayBtn } from "./components/Razorpay";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <RazorpayBtn />
        <Paypal />
      </header>
    </div>
  );
}

export default App;
