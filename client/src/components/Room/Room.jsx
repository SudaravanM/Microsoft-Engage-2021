import React, { useEffect, useRef, useState } from "react";
import { Grid, Paper, CardContent, Card, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const Button = styled.button`
  color: palevioletred;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

const StyledVideo = styled.video`
  margin: auto;
  height: 35%;
  width: 35%;
`;

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
  },
  myCard: {
    float: "right",
    // marginTop: "100%",
    width: "20%",
    height: "18%",
    borderRadius: "10px",
  },
  userCard: {
    width: "50%",
    height: "35%",
  },
});

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
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = room;
  // const userName = name;

  useEffect(() => {
    socketRef.current = io.connect(ENDPOINT);
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        // setStream(stream);
        userVideo.current.srcObject = stream;
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.emit("join room", roomID);
        // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        socketRef.current.on("all users", (users) => {
          const peers = [];

          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);

            peersRef.current.push({
              peerID: userID,
              peer,
              name,
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
        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);

          peersRef.current.push({
            peerID: payload.callerID,
            peer,
            name,
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

  return (
    <div className={classes.root}>
      <Card className={classes.myCard}>
        <CardContent>
          <video
            height="100%"
            width="100%"
            muted
            ref={userVideo}
            autoPlay
            playsInline
          />
        </CardContent>
      </Card>
      {peersRef.current.map((peer) => {
        return (
          <div>
            <Video key={peer.peerID} peer={peer.peer} />
            <Typography>{name}</Typography>
          </div>
        );
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
