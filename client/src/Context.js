// import React, { createContext, useState, useRef, useEffect } from "react";
// import { io } from "socket.io-client";
// import Peer from "simple-peer";

// const SocketContext = createContext();

// const socket = io("http://localhost:5000");

// const ContextProvider = ({ children }) => {
//   const [Room, setRoom] = useState("");

//   useEffect(() => {
//     socket.emit("join-room");
//   }, []);

//   return (
//     <SocketContext.Provider
//       value={{
//         Room,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export { ContextProvider, SocketContext };
