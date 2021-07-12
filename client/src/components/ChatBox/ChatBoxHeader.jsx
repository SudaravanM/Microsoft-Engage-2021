import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const ChatHeader = (props) => {
  const history = useHistory();
  const { title, user, setName, setRoom, room, name } = props;

  useEffect(() => {
    setName(user.displayName);
    setRoom(title);
  }, [user, title]);

  return (
    <div className="ce-chat-title-container">
      <div className="ce-chat-title-text">Chat</div>
    </div>
  );
};

export default ChatHeader;
