"use client"
import { useRef } from "react"
import { useState, useEffect } from "react"
import {
  Mic,
  MicOff,
  Headphones,
  Volume2,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Settings,
  Users
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "../ui/tooltip"
import { Slider } from "../ui/slider"
import socket from "../../utils/socket"

export default function VoiceChannelUI({ activeChannel, setActiveChannel, activeUser ,previousChannel}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)

  // Handle mute state changes
  useEffect(() => {
    socket.emit("audio-status-change", { isMuted });
  }, [isMuted]);

  // Handle updated user list
  useEffect(() => {
    socket.on("userList", (users) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.off("userList");
    };
  }, []);

  // Handle joining/leaving voice channels
  useEffect(() => {
    if (!activeUser || !activeChannel) return;

    // Join the new channel
    socket.emit("joinVoiceChannel", { channelId: activeChannel._id, user: activeUser });

     // Initialize WebRTC connection
     const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" } // Public STUN server
      ]
    })
    peerConnectionRef.current = peerConnection

    // Handle incoming ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, channelId: activeChannel._id })
      }
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = event.streams[0]
      }
    }

    // Listen for signaling data from the server
    socket.on("offer", async ({ offer, senderId }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      socket.emit("answer", { answer, channelId: activeChannel._id, receiverId: senderId })
    })

    socket.on("answer", async ({ answer }) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    })

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })


    // Handle disconnect (tab close, refresh)
    const handleBeforeUnload = () => {
      socket.emit("leaveVoiceChannel", { user: activeUser });
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("offer")
      socket.off("answer")
      socket.off("ice-candidate")
    };
  }, [activeChannel, activeUser,activeChannel._id, activeUser._id, activeUser.username]);

  
  const handleStartAudio = async () => {
    try {
      setIsMuted(!isMuted)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current.srcObject = stream

      // Add local stream tracks to the peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream)
      })

      // Create and send an offer
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      socket.emit("offer", { offer, channelId: activeChannel._id, senderId: activeUser._id })
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const handleDisconnect = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    socket.emit("leave-channel", { channelId: activeChannel._id })
    setActiveChannel(previousChannel);
  }

 
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Channel header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">{activeChannel.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Users className="mr-2 h-4 w-4" />
              {connectedUsers.length}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Voice channel content */}
        <div className="flex flex-1 flex-col">
          {/* Connected users */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-4 text-lg font-semibold">Connected Users</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="relative flex flex-col items-center rounded-lg border border-border bg-card p-4"
                >
                  <div className="relative mb-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={`/placeholder.svg?height=80&width=80`}
                        alt={user.username}
                      />
                      <AvatarFallback className="text-xl">
                        {user.username?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user.isSpeaking && (
                      <div className="absolute inset-0 animate-pulse rounded-full border-2 border-green-500"></div>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                      {user.isMuted && (
                        <div className="rounded-full bg-destructive p-1">
                          <MicOff className="h-3 w-3" />
                        </div>
                      )}
                      {user.isDeafened && (
                        <div className="rounded-full bg-destructive p-1">
                          <Headphones className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-medium">{user.username}</span>
                  <div className="mt-2 flex items-center gap-2">
                    {user.hasVideo && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-primary p-1">
                            <Video className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Video On</TooltipContent>
                      </Tooltip>
                    )}
                    {user.isScreenSharing && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-primary p-1">
                            <ScreenShare className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Sharing Screen</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume control */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center gap-4">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                className="flex-1"
                value={volume}
                min={0}
                max={100}
                step={1}
                onValueChange={setVolume}
              />
              <span className="w-8 text-sm text-muted-foreground">{volume}%</span>
            </div>
          </div>

           {/* Audio controls */}
           <div className="flex items-center justify-center gap-2 border-t border-border p-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              onClick={handleStartAudio}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDisconnect}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <audio ref={localStreamRef} autoPlay muted></audio>
        <audio ref={remoteStreamRef} autoPlay></audio>
      </div>
    </TooltipProvider>
  );
}