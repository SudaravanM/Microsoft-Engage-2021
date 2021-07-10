import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const ChatHeader = (props) => {
  const history = useHistory();
  const { title, user, setName, setRoom, room, name } = props;

  useEffect(() => {
    setName(user.displayName);
    setRoom(title);
  }, [user, title]);

  const joinVideoRoom = () => {
    console.log(room, name);
    history.push(`/room/${title}`);
  };

  return (
    <div className="ce-chat-title-container">
      <div className="ce-chat-title-text">{title}</div>
      <button onClick={joinVideoRoom} className="vid-call">
        Video Call
      </button>
    </div>
  );
};

export default ChatHeader;
