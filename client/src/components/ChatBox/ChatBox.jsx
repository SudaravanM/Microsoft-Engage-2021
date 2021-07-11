import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
// import ChatFeed from "./ChatFeed";
import { ChatEngine, ChatList, ChatFeed } from "react-chat-engine";

const ChatBox = ({ room }) => {
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
          "project-id": "2fb6abae-f9ca-41ed-bf8f-c929bfa6c042",
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
        projectID="2fb6abae-f9ca-41ed-bf8f-c929bfa6c042"
        height="100vh"
        userName={user.email}
        userSecret={user.uid}
        renderChatSettings={(chatAppState) => {}}
        renderChatCard={(chat, index) => {}}
        renderNewChatForm={(creds) => {}}
        renderChatFeed={(chatAppState) => {
          // let TempState = chatAppState;

          // const { chats } = TempState;

          // console.log(TempState);

          // for (let key in chats) {
          //   if (room !== null) {
          //     if (chats[key].title === room) {
          //       TempState.activeChat = key;
          //     }
          //   }
          // }
          return <ChatFeed {...chatAppState} />;
        }}
        // renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
      />
    </div>
  );
};

export default ChatBox;
