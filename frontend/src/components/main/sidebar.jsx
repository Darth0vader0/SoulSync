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
import { Skeleton } from "../ui/skeleton"

// Mock data


const onlineUsers=
[
    { id: "1", username: "John Doe", status: "online" ,avatar :"JD"},
    { id: "2", username: "Jane Smith", status: "away",avatar:"JS" },
    { id: "3", username: "Bob Johnson", status: "online",avatar:"BJ" }
  ]


export default function Sidebar({ setActiveChannel, activeChannel,setActiveServerData }) {
  const [servers, setServers] = useState([]);       // List of all servers
  const [activeServer, setActiveServer] = useState([]); // Selected server
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("http://localhost:3001/getServers", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch servers");

        const result = await response.json();
        setServers(result.servers);

        // ✅ Auto-select the first server if none is active
        if (result.servers.length > 0) {
          setActiveServer(result.servers[0]);  
        }
      } catch (err) {
        console.error("Error fetching servers:", err.message);
      }
    };

    fetchServers();
  }, []);




  const handleServerClick = async (server,event) => {
    
    document.querySelectorAll(".server-icon").forEach(btn => {
      btn.classList.remove("active");
    });
  
    // Add "active" class to the clicked button
    event.currentTarget.classList.add("active");


 
    setActiveServer(server); // Update active server
    setLoading(true);
    setTextChannels([]);  // Reset channels before fetching new ones
    setVoiceChannels([]);
    try {
      const response = await fetch(`http://localhost:3001/getChannelsByServer?serverId=${server._id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        const text = data.channels.filter(channel => channel.type === "text");
        const voice = data.channels.filter(channel => channel.type === "voice");

        setTextChannels(text);
        setVoiceChannels(voice);
        console.log("text",text)
        console.log("voice",voice)
        // ✅ Auto-select the first text channel when switching servers
        if (text.length > 0) {
          setActiveChannel(text[0]);
        }
      } else {
        console.error("Error fetching channels:", data.message);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
    setTimeout(()=>{
      setLoading(false)
    },1000)
  }
  

  const handleChannelClick = (channel) => {
    setActiveChannel(channel)
  }



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
            {servers.map(server => (
              <Tooltip key={server._id}>
                <TooltipTrigger asChild>
                  <button
                    className={`server-icon`}
                    onClick={(e) => handleServerClick(server,e)}
                  >
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
                  {loading?
                  <div className="mt-4 space-y-3 animate-pulse">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-40 rounded-md" />
                  ))}
                </div>:
                textChannels.map(channel => (
                  <SidebarMenuItem key={channel._id}>
                    <SidebarMenuButton
                      isActive={activeChannel._id === channel._id}
                      onClick={() => handleChannelClick(channel)}
                    >
                      <Hash className="mr-2 h-4 w-4" />
                      <span>{channel.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
                  }
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
                  {loading?
                  <div className="mt-4 space-y-3 animate-pulse">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-40 rounded-md" />
                  ))}
                </div>:
                voiceChannels.map(channel => (
                  <SidebarMenuItem key={channel._id}>
                    <SidebarMenuButton
                      isActive={activeChannel._id === channel._id}
                      onClick={() => handleChannelClick(channel)}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      <span>{channel.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
                }
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
                          <span>{user.username}</span>
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
