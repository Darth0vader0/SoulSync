"use client"
import { useState,useEffect } from "react"
import {
  Hash,
  Volume2,
  Plus,
  UserPlus,
  Settings,
  Users,
  ChevronDown
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "../ui/tooltip"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "../ui/sidebar"

// Mock data
const servers = [
  {
    id: "gaming",
    name: "Gaming Hub",
    icon: "G",
    textChannels: [
      { id: "general", name: "general", type: "text" },
      { id: "memes", name: "memes", type: "text" },
      { id: "strategy", name: "strategy", type: "text" }
    ],
    voiceChannels: [
      { id: "lounge", name: "Lounge", type: "voice" },
      { id: "gaming", name: "Gaming", type: "voice" }
    ]
  },
  {
    id: "dev",
    name: "Dev Community",
    icon: "D",
    textChannels: [
      { id: "help", name: "help", type: "text" },
      { id: "projects", name: "projects", type: "text" }
    ],
    voiceChannels: [{ id: "collab", name: "Collaboration", type: "voice" }]
  },
  {
    id: "music",
    name: "Music Lovers",
    icon: "M",
    textChannels: [
      { id: "recommendations", name: "recommendations", type: "text" },
      { id: "releases", name: "new-releases", type: "text" }
    ],
    voiceChannels: [{ id: "listening", name: "Listening Party", type: "voice" }]
  }
]

const onlineUsers = [
  { id: "1", name: "Jane Smith", avatar: "JS", status: "online" },
  { id: "2", name: "John Doe", avatar: "JD", status: "idle" },
  { id: "3", name: "Alex Johnson", avatar: "AJ", status: "dnd" },
  { id: "4", name: "Sam Wilson", avatar: "SW", status: "online" }
]

export default function Sidebar({ onChannelSelect, activeChannel }) {
  const [activeServer, setActiveServer] = useState(servers[0])
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);

  const handleServerClick =async (server) => {
    setActiveServer(server)
    setTextChannels([]);
    setVoiceChannels([]);
    try {
      const response = await fetch(`https://soulsync-52q9.onrender.com/getChannelsByServer?serverId=${server._id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      if (data.success) {
        // Separate channels into text and voice
        const text = data.channels.filter(channel => channel.type === "text");
        const voice = data.channels.filter(channel => channel.type === "voice");

        setTextChannels(text);
        setVoiceChannels(voice);
        console.log("textChannels",textChannels)
        console.log("voiceChannels",voiceChannels)
  
      } else {
        console.error("Error fetching channels:", data.message);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
    // Set the first text channel as active when switching servers
    onChannelSelect(server.textChannels[0])
  }

  const handleChannelClick = channel => {
    onChannelSelect(channel)
    console.log(server)
  }
  const [server,setServers]= useState([])
  
   useEffect(() => {
      const fetchServers = async () => {
        try {
          const response = await fetch("https://soulsync-52q9.onrender.com/getServers", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (!response.ok) throw new Error("Failed to fetch data");
    
          const result = await response.json();
          console.log((result.server));
          setServers(result.servers);
        } catch (err) {
          setError(err.message);
        }
      };
  
    
    fetchServers();
    }, []);
    console.log(server)


  const getStatusColor = status => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "dnd":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <TooltipProvider>
      <ShadcnSidebar className="flex border-r border-border">
        <div className="flex h-full">
          {/* Server icons column */}
          <div className="flex w-[72px] flex-col items-center gap-2 overflow-y-auto bg-background p-2 py-4">
            {server.map(server => (
              <Tooltip key={server._id}>
                <TooltipTrigger asChild>
                  <button
                    className={`server-icon ${
                      activeServer.id === server._id ? "active" : ""
                    }`}
                    onClick={() => handleServerClick(server)}
                  >
                    {server.id === activeServer.id && (
                      <div className="server-icon-indicator"></div>
                    )}
                    {server.name.slice(0,1)}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{server.name}</TooltipContent>
              </Tooltip>
            ))}
            <Separator className="my-2 w-10" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="server-icon bg-muted hover:bg-green-600">
                  <Plus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Create Server</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="server-icon bg-muted hover:bg-primary">
                  <UserPlus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Join Server</TooltipContent>
            </Tooltip>
          </div>

          {/* Channels column */}
          <SidebarContent className="w-56 border-l border-border bg-card">
            <SidebarHeader className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold">{activeServer.name}</h2>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SidebarHeader>

            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center px-2 py-1">
                <ChevronDown className="mr-1 h-3 w-3" />
                TEXT CHANNELS
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activeServer.textChannels.map(channel => (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton
                        isActive={activeChannel.id === channel.id}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        <span>{channel.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center px-2 py-1">
                <ChevronDown className="mr-1 h-3 w-3" />
                VOICE CHANNELS
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activeServer.voiceChannels.map(channel => (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton
                        isActive={activeChannel.id === channel.id}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <Volume2 className="mr-2 h-4 w-4" />
                        <span>{channel.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto">
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center px-2 py-1">
                  <Users className="mr-1 h-3 w-3" />
                  ONLINE — {onlineUsers.length}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {onlineUsers.map(user => (
                      <SidebarMenuItem key={user.id}>
                        <SidebarMenuButton>
                          <div className="relative mr-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`/placeholder.svg?height=24&width=24`}
                                alt={user.name}
                              />
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${getStatusColor(
                                user.status
                              )}`}
                            ></div>
                          </div>
                          <span>{user.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
            <SidebarRail />
          </SidebarContent>
        </div>
      </ShadcnSidebar>
    </TooltipProvider>
  )
}
