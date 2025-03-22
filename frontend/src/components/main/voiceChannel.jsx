"use client"
import { useState,useEffect } from "react"
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

// Mock data
const connectedUsers = [
 
]

export default function VoiceChannelUI({ activeChannel,activerServerData,setActiveChannel, activeUser }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [volume, setVolume] = useState([50])

  const [connectedUsers, setConnectedUsers] = useState([]); // Track real-time users
  const [currentChannel, setCurrentChannel] = useState(null); // Store the current channel

  useEffect(() => {
    if (!activeUser || !activeChannel) return;

    // If the user is switching channels, leave the previous one first
    if (currentChannel && currentChannel !== activeChannel._id) {
      socket.emit("leaveVoiceChannel", { user : activeUser });
    }

    // Join the new channel
    socket.emit("joinVoiceChannel", { channelId: activeChannel._id, user: activeUser});
    setCurrentChannel(activeChannel._id);

    // Listen for real-time updates
    socket.on("userList", (users) => {
      console.log("🔄 Updated Voice Channel Users:", users);
      
    });

    // Handle disconnect (tab close, refresh)
    const handleBeforeUnload = () => {
      socket.emit("leaveVoiceChannel", { user :activeUser });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("userList");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeChannel, activeUser]);

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
                  <div className="relative mb-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={`/placeholder.svg?height=80&width=80`}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-xl">
                        {user.avatar}
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
                  <span className="font-medium">{user.name}</span>
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
          

          {/* Voice controls */}
          <div className="flex items-center justify-center gap-2 border-t border-border p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="icon"
                  onClick={() => setIsDeafened(!isDeafened)}
                >
                  <Headphones className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDeafened ? "Undeafen" : "Deafen"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hasVideo ? "default" : "secondary"}
                  size="icon"
                  onClick={() => setHasVideo(!hasVideo)}
                >
                  {hasVideo ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasVideo ? "Turn Off Camera" : "Turn On Camera"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isScreenSharing ? "default" : "secondary"}
                  size="icon"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                >
                  <ScreenShare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="icon">
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Disconnect</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
