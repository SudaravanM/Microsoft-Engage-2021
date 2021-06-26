import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Login from "./components/Login/Login";
import Room from "./components/Room/Room";

function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Login room={room} name={name} setRoom={setRoom} setName={setName} />
        </Route>
        {/* <Route path="/room">
          <Room room={room} name={name} setRoom={setRoom} setName={setName} />
        </Route> */}
        <Route path="/room/:roomName">
          <Room room={room} name={name} setRoom={setRoom} setName={setName} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

// {/* <Login room={room} Name={Name} setName={setName} setRoom={setRoom} /> */}
// {/* <Route path="/room:roomName">
//   <Room room={room} Name={Name} setName={setName} setRoom={setRoom} />;
// </Route> */}
