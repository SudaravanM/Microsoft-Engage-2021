import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const ChatHeader = (props) => {
  const history = useHistory();
  const { title, setName, setRoom, userName } = props;

  useEffect(() => {
    setRoom(title);
    setName(userName);
  }, []);

  const joinVideoRoom = () => {
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
