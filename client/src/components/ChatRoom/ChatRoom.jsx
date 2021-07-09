import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ChatEngine, OptionsSettings } from "react-chat-engine";
import ChatHeader from "../ChatHeader/ChatHeader";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const ChatRoom = ({ room, name, setName, setRoom }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  async function handleLogout() {
    await auth.signOut();
    history.push("/");
  }
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
  }, [user, history]);

  if (!user || loading) return "Loading...";

  return (
    <div className="chats-page">
      <div className="nav-bar">
        <div className="logo-tab">Teams Clone</div>
        <div onClick={handleLogout} className="logout-tab">
          Logout
        </div>
      </div>
      <ChatEngine
        height="calc(100vh - 66px)"
        projectID="2fb6abae-f9ca-41ed-bf8f-c929bfa6c042"
        userName={user.email}
        userSecret={user.uid}
        renderChatHeader={(props) => (
          <ChatHeader
            {...props}
            userName={user.displayName}
            room={room}
            name={name}
            setRoom={setRoom}
            setName={setName}
          />
        )}
        renderOptionsSettings={(creds, chat) => <OptionsSettings />}
      />
    </div>
  );
};

export default ChatRoom;
