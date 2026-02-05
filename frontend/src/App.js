import React, { useEffect } from "react";
import api from "../services/api";

function App() {

  useEffect(() => {
    api.get("/")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>Smart Farm Frontend</h1>
    </div>
  );
}

export default App;
