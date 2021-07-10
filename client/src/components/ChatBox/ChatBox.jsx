import React, { useEffect, useState } from "react";
import { Card, Grid, Paper } from "@material-ui/core";
import styles from "./ChatBox.module.css"; // Import css modules stylesheet as styles
import { Typography } from "@material-ui/core";
import io from "socket.io-client";

let socket;

const ChatBox = (props) => {
  const ENDPOINT = "http://localhost:5000";
  const { name, room, setName, setRoom } = props;
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT, room]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
    console.log(message, messages);
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };
  return (
    <div className={styles.outerContainer}>
      <div className={styles.container}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyPress={(event) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        />
      </div>
    </div>
  );
};

export default ChatBox;
