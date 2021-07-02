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
import { useHistory, Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { CallEnd } from "@material-ui/icons";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  margin: auto;
  padding: 5px;
  height: 35%;
  width: 35%;
  float: right;
  border-radius: 10px;
`;

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
  },
  myCard: {
    float: "right",
    width: "23%",
    height: "25%",
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
    left: "20%",
    margin: "5px",
  },
  myName: {
    textAlign: "center",
    fontSize: "25px",
  },
}));

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = ({ room, name, setName, setRoom }) => {
  const classes = useStyles();

  const ENDPOINT = "http://localhost:5000";
  const [peers, setPeers] = useState([]);
  const [videoOn, setVideoOn] = useState(true);
  const [MicOn, setMicOn] = useState(true);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [NameMap, setNameMap] = useState({});
  const history = useHistory();
  const roomID = room;
  const userName = name;

  useEffect(() => {
    socketRef.current = io.connect(ENDPOINT);
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        // setStream(stream);
        userVideo.current.srcObject = stream;
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
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
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

  function updatePeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    // peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div>
      <div className={classes.root}>
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
                setMicOn(!MicOn);
              }}
            >
              {MicOn ? (
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
                setVideoOn(!videoOn);
              }}
            >
              {videoOn ? (
                <VideocamIcon fontSize="large" style={{ color: "green" }} />
              ) : (
                <VideocamOffIcon fontSize="large" style={{ color: "red" }} />
              )}
            </IconButton>
          </CardActions>
        </Card>
      </div>
      {peersRef.current.map((peer) => {
        return <Video key={peer.peerID} peer={peer.peer} />;
      })}
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
