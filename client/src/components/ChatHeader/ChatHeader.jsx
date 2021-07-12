import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import VideoCallIcon from "@material-ui/icons/VideoCall";

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
      <IconButton onClick={joinVideoRoom} className="vid-call" id="vid-call">
        <VideoCallIcon fontSize="large" style={{ color: "#3f51b5" }} />
      </IconButton>
    </div>
  );
};

export default ChatHeader;
