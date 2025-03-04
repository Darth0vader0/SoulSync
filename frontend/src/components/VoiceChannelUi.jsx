import { Buffer } from 'buffer';
import process from 'process';

window.global = window;
window.Buffer = Buffer;
window.process = process;


import { useEffect, useState,useRef } from 'react';
import { Volume2, UserPlus, Settings, PhoneOff, Mic, Video, Monitor, Headphones } from 'lucide-react';
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
const socket = io("http://localhost:3001"); // Update with backend URL

const VoiceChannelUI = ({ activeChannel, userId,setActiveChannel,activerServerData }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]); // Dynamic user list
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);

  const myAudioRef = useRef();
  const peerRefs = useRef({});
  useEffect(() => {
    if (!activeChannel || !userId) return;

    socket.emit("joinVoiceChannel", activeChannel._id, userId);

    socket.on("userList", (Users) => {
      setConnectedUsers(Users.filter(u => u.joinChannel === activeChannel._id));
    });

    navigator.mediaDevices.getUserMedia({ audio: true }).then((audioStream) => {
      setStream(audioStream);
      myAudioRef.current.srcObject = audioStream;
      socket.emit("voiceRequestPeers", activeChannel._id);
    });

    socket.on("initiatePeer", (peerId) => {
      createPeer(peerId, stream);
    });

    socket.on("receiveSignal", ({ from, signal }) => {
      acceptPeer(from, signal, stream);
    });

    socket.on("finalizeConnection", ({ from, signal }) => {
      peerRefs.current[from]?.signal(signal);
    });

    socket.on("userDisconnected", (peerId) => {
      if (peerRefs.current[peerId]) {
        peerRefs.current[peerId].destroy();
        delete peerRefs.current[peerId];
        setPeers((prev) => {
          const updatedPeers = { ...prev };
          delete updatedPeers[peerId];
          return updatedPeers;
        });
      }
    });

    return () => {
      socket.emit("leaveVoiceChannel", activeChannel._id, userId);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [activeChannel, userId]);
  
  const createPeer = (peerId, stream) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("sendSignal", { to: peerId, signal });
    });

    peer.on("stream", (peerStream) => {
      setPeers((prev) => ({ ...prev, [peerId]: peerStream }));
    });

    peerRefs.current[peerId] = peer;
  };

  const acceptPeer = (peerId, signal, stream) => {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("returnSignal", { to: peerId, signal });
    });

    peer.on("stream", (peerStream) => {
      setPeers((prev) => ({ ...prev, [peerId]: peerStream }));
    });

    peer.signal(signal);
    peerRefs.current[peerId] = peer;
  };
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted; // Toggle mute/unmute
      });
  
      setIsMuted(!isMuted);
      socket.emit("toggleMute", { userId, isMuted: !isMuted, channelId: activeChannel._id });
    }
  };
  useEffect(() => {
    socket.on("userMuted", ({ userId, isMuted }) => {
      setConnectedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isMuted } : user
        )
      );
    });
  
    return () => {
      socket.off("userMuted");
    };
  }, []);
    


  const handleLeaveChannel=()=>{
    // Leave the voice channel when the user clicks the leave channel button
    socket.emit("leaveVoiceChannel",  activeChannel._id, userId );

    setActiveChannel(null)
    Object.values(peerRefs.current).forEach(peer => peer.destroy());
    peerRefs.current = {};
    setPeers({});

  }


  return (
    <div className="flex flex-col h-full bg-[#36393f]">
      {/* Voice Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202225] shadow-sm">
        <div className="flex items-center space-x-2">
          <Volume2 size={24} className="text-[#8e9297]" />
          <span className="font-bold text-white">{activeChannel?.name}</span>
        </div>
        <div className="flex items-center space-x-4 text-[#b9bbbe]">
          <button className="hover:text-[#dcddde]"><UserPlus size={20} /></button>
          <button className="hover:text-[#dcddde]"><Settings size={20} /></button>
        </div>
      </div>

      {/* Connected Users List */}
      <div className="flex-1 p-4">
        <audio ref={myAudioRef} autoPlay playsInline />
        {Object.keys(peers).map((peerId) => (
          <audio key={peerId} srcObject={peers[peerId]} autoPlay playsInline />
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedUsers.map((user) => (
            <div key={user.id} className="bg-[#2f3136] p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white bg-[#5865f2]`}>
                  {user.username.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{user.username}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="bg-[#292b2f] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={toggleMute} className={`p-2 rounded-lg ${isMuted ? "bg-red-500" : "bg-[#36393f]"} hover:bg-[#4f545c]'`}>
              <Mic size={20} className={isMuted ? "text-gray-500" : "text-white"} />
            </button>
            <button onClick={() => setIsDeafened(!isDeafened)} className={`p-2 rounded-lg ${isDeafened ? "bg-red-500" : "bg-[#36393f]"} hover:bg-[#4f545c]'`}>
              <Headphones size={20} className="text-white" />
            </button>
          </div>
          <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600" onClick={handleLeaveChannel}>
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelUI;
