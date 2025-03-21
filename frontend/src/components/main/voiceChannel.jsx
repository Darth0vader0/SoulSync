import { useEffect, useRef, useState } from "react";
import socket from "../../utils/socket";

export default function VoiceChannelUI({ activeChannel, activeUser }) {
  const [peers, setPeers] = useState([]);
  const peersRef = useRef(new Map());
  const userAudioRef = useRef();

  useEffect(() => {
    if (!activeUser || !activeChannel) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      userAudioRef.current.srcObject = stream;
      socket.emit("joinVoiceChannel", { channelId: activeChannel._id, user: activeUser });

      socket.on("user-joined", ({ userId }) => {
        const peer = createPeer(userId, stream);
        peersRef.current.set(userId, peer);
      });

      socket.on("offer", ({ senderId, offer }) => {
        const peer = addPeer(senderId, stream, offer);
        peersRef.current.set(senderId, peer);
      });

      socket.on("answer", ({ senderId, answer }) => {
        const peer = peersRef.current.get(senderId);
        if (peer) peer.signal(answer);
      });

      socket.on("ice-candidate", ({ senderId, candidate }) => {
        const peer = peersRef.current.get(senderId);
        if (peer) peer.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });

    return () => {
      socket.emit("leaveVoiceChannel", { user: activeUser });
    };
  }, [activeChannel, activeUser]);

  const createPeer = (userId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { targetUserId: userId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
    };

    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socket.emit("offer", { targetUserId: userId, offer });
    });

    return peer;
  };

  const addPeer = (senderId, stream, offer) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { targetUserId: senderId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
    };

    peer.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
      peer.createAnswer().then((answer) => {
        peer.setLocalDescription(answer);
        socket.emit("answer", { targetUserId: senderId, answer });
      });
    });

    return peer;
  };

  return (
    <div>
      <h2>{activeChannel.name} - Voice Channel</h2>
      <audio ref={userAudioRef} autoPlay  /> {/* Prevent self-audio */}
    </div>
  );
}
