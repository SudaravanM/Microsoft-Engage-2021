import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

import Login from "./components/Login/Login";
import Room from "./components/Room/Room";
import ChatRoom from "./components/ChatRoom/ChatRoom";

function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={{ fontFamily: "Avenir" }}>
      <Router>
        <AuthProvider>
          <Switch>
            <Route exact path="/" component={Login}></Route>
            <Route path="/chats">
              <ChatRoom
                room={room}
                name={name}
                setRoom={setRoom}
                setName={setName}
              />
            </Route>
            <Route path="/room/:roomName">
              <Room
                room={room}
                name={name}
                setRoom={setRoom}
                setName={setName}
              />
            </Route>
          </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

// {/* <Login room={room} Name={Name} setName={setName} setRoom={setRoom} /> */}
// {/* <Route path="/room:roomName">
//   <Room room={room} Name={Name} setName={setName} setRoom={setRoom} />;
// </Route> */}
