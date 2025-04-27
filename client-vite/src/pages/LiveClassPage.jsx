import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Container, Spinner, Alert, ListGroup } from "react-bootstrap";

const LiveClassPage = () => {
  const { id: classId } = useParams();
  const videoRef = useRef(null);
  const [isHost, setIsHost] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // Map<viewerSocketId, RTCPeerConnection>
  const localStreamRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]); // State to hold connected users

  useEffect(() => {
    if (!classId) {
      setError("No class ID provided");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      setError("No user ID found");
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
      });
    }

    const socket = socketRef.current;

    const joinRoom = () => {
      socket.emit("join-room", { classId, userId }, (ack) => {
        console.log("Join-room acknowledgement:", ack);
      });
    };

    const setupHost = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Listen for viewers joining
        socket.on(
          "user-joined",
          async ({ socketId: viewerSocketId, username }) => {
            console.log("New viewer joined:", viewerSocketId);
            setConnectedUsers((prevUsers) => [...prevUsers, username]); // Add new viewer to the list of users

            const pc = new RTCPeerConnection({
              iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            peerConnectionsRef.current.set(viewerSocketId, pc);

            pc.onicecandidate = (event) => {
              if (event.candidate) {
                socket.emit("send-ice-candidate", {
                  targetSocketId: viewerSocketId,
                  candidate: event.candidate,
                });
              }
            };

            // Add tracks
            stream.getTracks().forEach((track) => {
              pc.addTrack(track, stream);
            });

            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("offer", {
              targetSocketId: viewerSocketId,
              offer: pc.localDescription,
            });
          }
        );

        // Receive answer from viewer
        socket.on("answer", ({ senderSocketId, answer }) => {
          const pc = peerConnectionsRef.current.get(senderSocketId);
          if (pc) {
            pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        // Receive ICE candidates from viewer
        socket.on("receive-ice-candidate", ({ senderSocketId, candidate }) => {
          const pc = peerConnectionsRef.current.get(senderSocketId);
          if (pc && candidate) {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
      } catch (err) {
        console.error("Error setting up host media:", err);
        setError("Error accessing camera/microphone.");
      }
    };

    const setupViewer = () => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.ontrack = (event) => {
        console.log("Received remote stream from host");
        if (event.streams && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("send-ice-candidate", {
            targetSocketId: null, // tell server to relay to host
            candidate: event.candidate,
          });
        }
      };

      // Receive offer from host
      socket.on("offer", async ({ senderSocketId, offer }) => {
        console.log("Received offer from host");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          targetSocketId: senderSocketId,
          answer,
        });
      });

      // Receive ICE candidates from host
      socket.on("receive-ice-candidate", ({ candidate }) => {
        if (candidate) {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });
    };

    const roleAssignmentHandler = ({ isHost: hostStatus }) => {
      if (isHost === null) {
        setIsHost(hostStatus);
        if (hostStatus) {
          setupHost();
        } else {
          setupViewer();
        }
      }
    };

    socket.on("role-assignment", roleAssignmentHandler);

    socket.on("connect", () => {
      console.log("Connected with socket id:", socket.id);
      joinRoom();
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      // Cleanup
      socket.off("role-assignment", roleAssignmentHandler);
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("receive-ice-candidate");
      socket.off("connect");
      socket.off("connect_error");

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [classId]);

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (isHost === null) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <div>Connecting to live class...</div>
      </Container>
    );
  }

  return (
    <Container
      className="my-4"
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <div style={{ flex: 1 }}>
        <h2 className="mb-4">
          {isHost ? "You are the Host" : "Viewing the Host's Stream"}
        </h2>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost}
          controls={!isHost}
          onError={(e) => console.error("Video error:", e.target.error)}
          style={{
            width: "100%",
            maxHeight: "80vh",
            backgroundColor: "black",
            border: isHost ? "3px solid red" : "3px solid green",
          }}
        />
      </div>

      <div
        style={{
          width: "250px",
          paddingLeft: "20px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #ddd",
          borderRadius: "5px",
          height: "fit-content",
        }}
      >
        <h5>Connected Users</h5>
        <ListGroup>
          {connectedUsers.map((username, index) => (
            <ListGroup.Item key={index}>{username}</ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </Container>
  );
};

export default LiveClassPage;
