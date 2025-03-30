"use client"
import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Volume2,
  PhoneOff,
  Settings,
  Users
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  TooltipProvider
} from "../ui/tooltip"
import socket from "../../utils/socket"

export default function VoiceChannelUI({ activeChannel, activeServerData, setActiveChannel, activeUser }) {
  const [isMuted, setIsMuted] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState([])
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)

  useEffect(() => {
    // Join the channel
    socket.emit("join-channel", {
      channelId: activeChannel._id,
      userId: activeUser._id,
      userInfo: { username: activeUser.username }
    })

    // Listen for users joining the channel
    socket.on("user-joined", ({ userId, userInfo }) => {
      setConnectedUsers((prev) => [...prev, { id: userId, ...userInfo }])
    })

    // Listen for users leaving the channel
    socket.on("user-left", ({ userId }) => {
      setConnectedUsers((prev) => prev.filter((user) => user.id !== userId))
    })

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

    return () => {
      // Cleanup on component unmount
      peerConnection.close()
      socket.emit("leave-channel", { channelId: activeChannel._id })
      socket.off("user-joined")
      socket.off("user-left")
      socket.off("offer")
      socket.off("answer")
      socket.off("ice-candidate")
    }
  }, [activeChannel._id, activeUser._id, activeUser.username])

  const handleStartAudio = async () => {
    try {
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
              {connectedUsers.map(user => (
                <div
                  key={user.id}
                  className="relative flex flex-col items-center rounded-lg border border-border bg-card p-4"
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={`/placeholder.svg?height=80&width=80`}
                      alt={user.username}
                    />
                    <AvatarFallback className="text-xl">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.username}</span>
                </div>
              ))}
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

        {/* Audio elements */}
        <audio ref={localStreamRef} autoPlay muted />
        <audio ref={remoteStreamRef} autoPlay />
      </div>
    </TooltipProvider>
  )
}