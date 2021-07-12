import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ChatEngine, OptionsSettings, PeopleSettings } from "react-chat-engine";
import ChatBox from "../ChatBox/ChatBox";
import ChatHeader from "../ChatHeader/ChatHeader";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { ExitToApp } from "@material-ui/icons";

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
  }, [user, history]);

  if (!user || loading) return "Loading...";

  return (
    <div className="chats-page">
      <div className="nav-bar">
        <img src="https://img.icons8.com/fluent/50/000000/microsoft-teams-2019.png" />
        <div className="logo-tab">Microsoft Teams</div>
        <div onClick={handleLogout} className="logout-tab">
          <ExitToApp />
        </div>
      </div>
      <div>
        <ChatEngine
          height="calc(100vh - 65px)"
          // height=""
          projectID={process.env.REACT_APP_CHAT_ENGINE_ID}
          userName={user.email}
          userSecret={user.uid}
          renderChatHeader={(props) => (
            <ChatHeader
              {...props}
              user={user}
              room={room}
              name={name}
              setRoom={setRoom}
              setName={setName}
            />
          )}
          // renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
          renderPeopleSettings={(creds, chat, props) => {
            return <PeopleSettings />;
          }}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
