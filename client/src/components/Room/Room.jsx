import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  CardActions,
  CardContent,
  Card,
  Typography,
  IconButton,
} from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import CallEndIcon from "@material-ui/icons/CallEnd";
import PresentToAllIcon from "@material-ui/icons/PresentToAll";
import { makeStyles } from "@material-ui/core/styles";
import ChatBox from "../ChatBox/ChatBox";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled, { isStyledComponent } from "styled-components";
import { CallEnd } from "@material-ui/icons";

import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";

import TopBar from "../TopBar/TopBar";

import { ChatFeed } from "react-chat-engine";
import { ChatEngine, ChatList } from "react-chat-engine";

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  flex-wrap: wrap;
`;
// padding: 5px;
// margin: auto;

const StyledVideo = styled.video`
  margin: 25px;
  height: 100%;
  width: 100%;
  float: right;
  border-radius: 15px;
`;

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
  },
  myCard: {
    width: "40%",
    height: "30%",
    borderRadius: "10px",
  },
  myVideo: {
    transform: "rotateY(180deg)",
  },
  userCard: {
    width: "50%",
    height: "35%",
  },
  row: {
    width: "100%",
  },
  block: {
    width: "100px",
    display: "inline-block",
  },
  buttons: {
    left: "13%",
  },
  myName: {
    textAlign: "center",
    fontSize: "25px",
  },
  video_wrapper: {
    height: "100%",
    display: "inline-flex",
  },
}));

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo controls playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = ({ room, name, setName, setRoom }) => {
  const classes = useStyles();

  // const ENDPOINT = "http://localhost:5000";
  const ENDPOINT = "https://chat-app-sudhirmts.herokuapp.com/";
  const [peers, setPeers] = useState([]);
  const [IsVideoOn, setIsVideoOn] = useState(true);
  const [IsMicOn, setIsMicOn] = useState(true);
  const [IsScreenSharingOn, setIsScreenSharingOn] = useState(false);
  const [NameMap, setNameMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [ChatButton, setChatButton] = useState(false);
  const { user } = useAuth();
  const history = useHistory();
  const socketRef = useRef();
  const userVideo = useRef();
  const userStream = useRef();
  const peersRef = useRef([]);

  const roomID = room;
  const userName = name;

  useEffect(() => {
    socketRef.current = io.connect(ENDPOINT);
    console.log("Socket in VidRoom ->", socketRef.current);
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.emit("join room", { roomID, userName });
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.on("all users", ({ users, socketToName }) => {
          const peers = [];

          setNameMap(socketToName);

          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);

            peersRef.current.push({
              peerID: userID,
              peer,
            });

            // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            // userStream.current.getTracks().forEach((track) => {
            //   senders.current.push(
            //   peer.streams[0].addTrack(track, userStream.current)
            //   );
            //   console.log(peer.streams);
            //   console.log(peer.streams[0]);
            // });
            // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

            peers.push({
              peerID: userID,
              peer,
            });
          });

          setPeers(peers);

          console.log("peersRef on all users ->", peersRef);
          console.log("peers on all users ->", peers);
        });
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
          console.log("peersRef on users left ->", peersRef);
          console.log("peers on users left ->", peers);
        });
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.on("user joined", ({ payload, socketToName }) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);

          setNameMap(socketToName);

          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          const peerObj = {
            peer,
            peerID: payload.callerID,
          };
          setPeers((users) => [...users, peerObj]);
          console.log("peersRef in user joined->", peersRef);
          console.log("peers in user joined->", peers);
        });
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
        // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      });
    console.log("UseEffect Executed");
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
      setIsScreenSharingOn(true);
      const screenTrack = stream.getTracks()[0];
      if (!IsScreenSharingOn) {
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            userVideo.current.srcObject.getVideoTracks()[0],
            screenTrack,
            userStream.current
          );
        });
      } else {
        // const screenTrack = stream.getTracks()[0];
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            screenTrack,
            userVideo.current.srcObject.getVideoTracks()[0],
            userStream.current
          );
        });
      }
      screenTrack.onended = () => {
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(
            screenTrack,
            userVideo.current.srcObject.getVideoTracks()[0],
            userStream.current
          );
        });
        console.log("Presentation Ended");
        setIsScreenSharingOn(false);
      };
    });
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
    console.log();
  }, [user, history]);

  return (
    <div>
      <TopBar />
      <Container className={classes.root} id="room">
        <div id="my-card">
          <Card className={classes.myCard}>
            <CardContent>
              <AppBar position="static">
                <Typography className={classes.myName}>{name}</Typography>
              </AppBar>
              <video
                className={classes.myVideo}
                height="100%"
                width="100%"
                muted
                ref={userVideo}
                autoPlay
                playsInline
              />
            </CardContent>
            <CardActions>
              <IconButton
                className={classes.buttons}
                onClick={() => {
                  userVideo.current.srcObject.getAudioTracks()[0].enabled =
                    !userVideo.current.srcObject.getAudioTracks()[0].enabled;
                  setIsMicOn(!IsMicOn);
                }}
              >
                {IsMicOn ? (
                  <MicIcon fontSize="large" style={{ color: "green" }} />
                ) : (
                  <MicOffIcon fontSize="large" style={{ color: "red" }} />
                )}
              </IconButton>
              <IconButton
                className={classes.buttons}
                onClick={() => {
                  socketRef.current.destroy();
                  window.location.assign(window.location.origin);
                }}
              >
                <CallEnd fontSize="large" style={{ color: "red" }} />
              </IconButton>
              <IconButton
                className={classes.buttons}
                onClick={() => {
                  userVideo.current.srcObject.getVideoTracks()[0].enabled =
                    !userVideo.current.srcObject.getVideoTracks()[0].enabled;
                  setIsVideoOn(!IsVideoOn);
                }}
              >
                {IsVideoOn ? (
                  <VideocamIcon fontSize="large" style={{ color: "green" }} />
                ) : (
                  <VideocamOffIcon fontSize="large" style={{ color: "red" }} />
                )}
              </IconButton>
              {!IsScreenSharingOn ? (
                <IconButton className={classes.buttons} onClick={shareScreen}>
                  <PresentToAllIcon fontSize="large" style={{ color: "red" }} />
                </IconButton>
              ) : (
                <IconButton className={classes.buttons} disabled>
                  <PresentToAllIcon fontSize="large" />
                </IconButton>
              )}
            </CardActions>
          </Card>
        </div>
        <ChatBox room={room} name={name} setRoom={setRoom} setName={setName} />
        {/* <div class="chat-box">
        <ChatEngine
          projectID="2fb6abae-f9ca-41ed-bf8f-c929bfa6c042"
          height="100vh"
          userName={user.email}
          userSecret={user.uid}
          renderChatSettings={(chatAppState) => {}}
          renderChatCard={(chat, index) => {}}
          renderNewChatForm={(creds) => {}}
          renderChatFeed={(chatAppState) => {
            let TempState = chatAppState;

            const { chats } = TempState;

            console.log(TempState);

            for (let key in chats) {
              if (room !== null) {
                if (chats[key].title === room) {
                  TempState.activeChat = key;
                }
              }
            }
            return <ChatFeed {...TempState} />;
          }}
        />
      </div> */}
        <div id="other-vid">
          {peersRef.current.map((peer) => {
            return <Video key={peer.peerID} peer={peer.peer} />;
          })}
        </div>
      </Container>
    </div>
  );
};
// peersRef.current
export default Room;
{
  /* <Container>
<Paper elevation={3}>
  <StyledVideo muted ref={userVideo} autoPlay playsInline />
  {peers.map((peer) => {
    return (
      <div>
        <Video key={peer.peerID} peer={peer.peer} />
      </div>
    );
  })}
</Paper>
</Container> */
}

// {peersRef.current.map((peer) => {
//   // return <Video key={peer.peerID} peer={peer.peer} />;
//   console.log(NameMap[peer.peerID]);
// })}
// {peersRef.current.length === 4 ? (
//   <div>
//     <Video
//       key={peersRef.current[0].peerID}
//       peer={peersRef.current[0].peer}
//     />
//     <Video
//       key={peersRef.current[1].peerID}
//       peer={peersRef.current[1].peer}
//     />
//     <Video
//       key={peersRef.current[2].peerID}
//       peer={peersRef.current[2].peer}
//     />
//     <Video
//       key={peersRef.current[3].peerID}
//       peer={peersRef.current[3].peer}
//     />
//   </div>
// ) : peersRef.current.length === 3 ? (
//   <div>
//     <Video
//       key={peersRef.current[0].peerID}
//       peer={peersRef.current[0].peer}
//     />
//     <Video
//       key={peersRef.current[1].peerID}
//       peer={peersRef.current[1].peer}
//     />
//     <Video
//       key={peersRef.current[2].peerID}
//       peer={peersRef.current[2].peer}
//     />
//   </div>
// ) : peersRef.current.length === 2 ? (
//   <div>
//     <Video
//       key={peersRef.current[0].peerID}
//       peer={peersRef.current[0].peer}
//     />
//     <Video
//       key={peersRef.current[1].peerID}
//       peer={peersRef.current[1].peer}
//     />
//   </div>
// ) : peersRef.current.length === 1 ? (
//   <div>
//     <Video
//       key={peersRef.current[0].peerID}
//       peer={peersRef.current[0].peer}
//     />
//   </div>
// ) : null}
