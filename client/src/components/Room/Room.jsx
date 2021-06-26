import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@material-ui/core";
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
  height: 40%;
  width: 50%;
`;

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
  // const [name, setName] = useState("");
  // const [room, setRoom] = useState("");
  // const { name, room, setName, setRoom } = props;
  const ENDPOINT = "http://localhost:5000";
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = room;

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
    <div>
      <h1>Room: {room}</h1>
      <Container>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer) => {
          return <Video key={peer.peerID} peer={peer.peer} />;
        })}
      </Container>
    </div>
  );
};
// peersRef.current
export default Room;
// {/* <Grid>
//   {stream && (
//     <Grid item md={6}>
//       {peers.map((peer, index) => {
//         // console.log(index, peer);
//         // return <Video key={index} peer={peer} />;
//         <video playsInline muted ref={userVideo} autoPlay />;
//       })}
//     </Grid>
//   )}
// </Grid> */}
