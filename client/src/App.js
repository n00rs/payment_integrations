// import { useEffect } from "react";
import "./App.css";
import { Card } from "./components/Card";

function App() {
  // useEffect(async () => {
  //   try {
  //     const res = await fetch("/api");
  //     const data = await res.json();
  //     alert(typeof data);

  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // });

  return (
    <div className="App">
      <header className="App-header">
        <Card />
      </header>
    </div>
  );
}

export default App;
