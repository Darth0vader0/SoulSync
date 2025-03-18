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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/lable"
import socket from "../../utils/socket"
// Mock data


const onlineUsers=
[
    { id: "1", username: "John Doe", status: "online" ,avatar :"JD"},
    { id: "2", username: "Jane Smith", status: "away",avatar:"JS" },
    { id: "3", username: "Bob Johnson", status: "online",avatar:"BJ" }
  ]

  const serverIconCSS = `
  .server-icon {
    min-height: 48px;
    min-width: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

   
    color: white;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.25rem;
  }
  
  .server-icon.active {
    border-radius: 30%;
  }
  
  .server-icon:hover {
    border-radius: 30%;
  }
  `
  const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = serverIconCSS
document.head.appendChild(styleSheet)
export default function Sidebar({ setActiveChannel, activeChannel,activeUser }) {
  const [servers, setServers] = useState([]);       // List of all servers
  const [activeServer, setActiveServer] = useState([]); // Selected server
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);

  const [loading, setLoading] = useState(false);
  const [createServerDialogOpen, setCreateServerDialogOpen] = useState(false)
  const [joinServerDialogOpen, setJoinServerDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isDmView, setIsDmView] = useState(false)

  const [directMessages, setDirectMessages] = useState([
    { id: "1", username: "Alice Cooper", status: "online", avatar: "AC", lastMessage: "Hey there!" },
    { id: "2", username: "Bob Dylan", status: "idle", avatar: "BD", lastMessage: "Can you help me?" },
    { id: "3", username: "Carol King", status: "dnd", avatar: "CK", lastMessage: "Thanks for yesterday" },
    { id: "4", username: "Dave Grohl", status: "offline", avatar: "DG", lastMessage: "Let's chat later" },
  ])

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

  useEffect(() => {
    if (!activeUser || servers.length === 0) return;
  
    const serverIds = servers.map(server => server._id);
  
    // Emit userConnected when component mounts
    socket.emit("userConnected", { userId: activeUser._id, serverIds });
  
    // Listen for real-time online users update
    const handleUpdateOnlineUsers = (data) => {
      console.log("🔵 Active Users Per Server:", data);
    };
  
    socket.on("updateOnlineUsers", handleUpdateOnlineUsers);
  
    return () => {
      // Emit userDisconnected when component unmounts
      socket.emit("userDisconnected", { userId: activeUser._id, serverIds });
  
      // Remove event listener to prevent memory leaks
      socket.off("updateOnlineUsers", handleUpdateOnlineUsers);
    };
  }, [activeUser, servers]);
  



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
  const handleInviteClick = async () => {
    if (!activeServer || !activeServer._id) return
    setInviteDialogOpen(true)
  }


  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopying(true)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopying(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      })
    }
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
          <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`server-icon ${isDmView ? "active bg-primary" : "bg-muted"}`}
                  onClick={() => setIsDmView(!isDmView)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Direct Messages</TooltipContent>
            </Tooltip>
            <Separator className="my-2 w-10" />
            
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
                <button className="server-icon bg-muted hover:bg-green-600"
                  onClick={() => setCreateServerDialogOpen(true)}
                >
                  <Plus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Create Server</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="server-icon bg-muted hover:bg-primary"
                  onClick={() => setJoinServerDialogOpen(true)}
                >
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
              <div className="flex items-center space-x-2">
              <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleInviteClick}>
                      <UserPlus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Invite People</TooltipContent>
                </Tooltip>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              </div>
             
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
         {/* Create Server Dialog */}
         <Dialog open={createServerDialogOpen} onOpenChange={setCreateServerDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new server</DialogTitle>
              <DialogDescription>Enter a name for your new server. You can always change it later.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const serverName = formData.get("serverName")

                try {
                  const response = await fetch("http://localhost:3001/createServer", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: serverName }),
                  })

                  if (!response.ok) throw new Error("Failed to create server")

                  const result = await response.json()
                  setCreateServerDialogOpen(false)
                  setServers((prevServers) => [...prevServers, result.server]);
                } catch (error) {
                  console.error("Error creating server:", error)
                }
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="serverName" className="col-span-4">
                    Server name
                  </Label>
                  <Input
                    id="serverName"
                    name="serverName"
                    placeholder="My Awesome Server"
                    className="col-span-4"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateServerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Server</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Join Server Dialog */}
        <Dialog open={joinServerDialogOpen} onOpenChange={setJoinServerDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join a server</DialogTitle>
              <DialogDescription>Enter an invite URL to join an existing server.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const inviteUrl = formData.get("inviteUrl")

                try {
                  const response = await fetch(`http://localhost:3001/joinServer`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inviteUrl }),
                  })

                  if (!response.ok) throw new Error("Failed to join server")

                  const result = await response.json()
                  if (result.success) {
                    // Add the joined server to the list
                    setServers((newServer)=>[...newServer, result.server])
                    setJoinServerDialogOpen(false)
                  }
                } catch (error) {
                  console.error("Error joining server:", error)
                }
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inviteUrl" className="col-span-4">
                    Invite URL
                  </Label>
                  <Input
                    id="inviteUrl"
                    name="inviteUrl"
                    placeholder="https://example.com/invite/abc123"
                    className="col-span-4"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setJoinServerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Join Server</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite People to {activeServer.name}</DialogTitle>
              <DialogDescription>Share this link with others to invite them to your server</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input value={`https://soul-sync/${activeServer._id}`} readOnly onClick={(e) => e.target.select()} />
            </div>
            <DialogFooter>
              <Button onClick={() => setInviteDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShadcnSidebar>
    </TooltipProvider>
  )
}
