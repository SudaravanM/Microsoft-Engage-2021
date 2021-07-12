import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { ChatEngine, ChatList, ChatFeed } from "react-chat-engine";
import ChatBoxHeader from "./ChatBoxHeader";

const ChatBox = (props) => {
  const { room, name, setRoom, setName } = props;
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const history = useHistory();

  const getFile = async (url) => {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], "userPhoto.jpg", { type: "image/jpeg" });
  };

  useEffect(() => {
    if (!user) {
      history.push("/");
      return;
    }

    axios
      .get("https://api.chatengine.io/users/me", {
        headers: {
          "project-id": process.env.REACT_APP_CHAT_ENGINE_ID,
          "user-name": user.email,
          "user-secret": user.uid,
        },
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        let formdata = new FormData();
        formdata.append("email", user.email);
        formdata.append("username", user.email);
        formdata.append("secret", user.uid);

        getFile(user.photoURL).then((avatar) => {
          formdata.append("avatar", avatar, avatar.name);

          axios
            .post("https://api.chatengine.io/users", formdata, {
              headers: {
                "private-key": process.env.REACT_APP_CHAT_ENGINE_KEY,
              },
            })
            .then(() => setLoading(false))
            .catch((error) => console.log(error));
        });
      });
    console.log();
  }, [user, history]);

  return (
    <div class="chat-box">
      <ChatEngine
        projectID={process.env.REACT_APP_CHAT_ENGINE_ID}
        height="89vh"
        userName={user.email}
        userSecret={user.uid}
        renderChatSettings={(chatAppState) => {}}
        renderChatCard={(chat, index) => {}}
        renderNewChatForm={(creds) => {}}
        renderChatFeed={(chatAppState) => {
          return <ChatFeed {...chatAppState} />;
        }}
        renderChatHeader={(props) => (
          <ChatBoxHeader
            {...props}
            user={user}
            room={room}
            name={name}
            setRoom={setRoom}
            setName={setName}
          />
        )}
      />
    </div>
  );
};

export default ChatBox;
