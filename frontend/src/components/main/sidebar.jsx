"use client"
import { useState, useEffect } from "react"
import {
  Hash,
  Volume2,
  Plus,
  UserPlus,
  Settings,
  Users,
  ChevronDown,
  Folder
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

const backendUrl = import.meta.env.VITE_BACKEND_URL;




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
export default function Sidebar({ setActiveChannel, activeChannel, activeUser, setActiveDmChat ,setPreviousChannel}) {
  const [servers, setServers] = useState([]);       // List of all servers
  const [activeServer, setActiveServer] = useState([]); // Selected server
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [resourcesChannels, setResourcesChannels] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createServerDialogOpen, setCreateServerDialogOpen] = useState(false)
  const [joinServerDialogOpen, setJoinServerDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isDmView, setIsDmView] = useState(false)
  const [serverMembers, setServerMembers] = useState([]);
  const [directMessages, setDirectMessages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createServerName, setCreateServerName] = useState("")
  const [error, setError] = useState(null)
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(`${backendUrl}/getServers`, {
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
    const users = getAllUsers();
    users.then((data) => {
      setDirectMessages(data.filter(user => user._id !== activeUser._id))
    }
    ).catch((error) => {
      console.error("Error fetching users:", error.message);
    })

  }, []);

  useEffect(() => {
    if (!activeUser || servers.length === 0) return;

    const serverIds = servers.map(server => server._id);

    // Emit userConnected when component mounts
    socket.emit("userConnected", { userId: activeUser._id, serverIds });

    // Listen for real-time online users update
    const handleUpdateOnlineUsers = (data) => {
      setOnlineUsers(data);
    };

    socket.on("updateOnlineUsers", handleUpdateOnlineUsers);

    return () => {
      // Emit userDisconnected when component unmounts
      socket.emit("userDisconnected", { userId: activeUser._id, serverIds });

      // Remove event listener to prevent memory leaks
      socket.off("updateOnlineUsers", handleUpdateOnlineUsers);
    };
  }, [activeUser, servers]);

  const handleDmClick = () => {
    // Remove "active" class from all server icons
    document.querySelectorAll(".server-icon").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Set DM view active
    setActiveChannel(null);
    setIsDmView(true);
  };

  // Sanitize server name to prevent XSS and SQL injection attacks
  const sanitizeServerName = (name) => {
    // Strip HTML/script tags
    const clean = name.replace(/<[^>]*>?/gm, '');
    // Remove suspicious characters
    return clean.replace(/['"`;$]/g, '');
  };

  const handleServerClick = async (server, event) => {

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
      const response = await fetch(`${backendUrl}/getChannelsByServer?serverId=${server._id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        const text = data.channels.filter(channel => channel.type === "text");
        const voice = data.channels.filter(channel => channel.type === "voice");
        const resources = data.channels.filter(channel => channel.type === 'resources')
        setTextChannels(text);
        setVoiceChannels(voice);
        setResourcesChannels(resources);

        // ✅ Auto-select the first text channel when switching servers
        if (text.length > 0) {
          setActiveChannel(text[0]);
        }
      } else {
        console.error("Error fetching channels:", data.message);
      }
      // 🔹 Fetch Server Members
      const membersResponse = await fetch(`${backendUrl}/server/${server._id}/members`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const membersData = await membersResponse.json();
      if (membersData.success) {
        setServerMembers(membersData.members);
      } else {
        console.error("Error fetching members:", membersData.message);
      }

    } catch (error) {
      console.error("Error fetching channels:", error);
    }

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }
  async function getAllUsers() {
    const response = await fetch(`${backendUrl}/getAllUsers`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    if (data.success) {
      return data.users
    } else {
      console.error("Error fetching users:", data.message)
    }
  }

  const handleChannelClick = (channel) => {
    setPreviousChannel(activeChannel)
    setActiveChannel(channel)
  }
  const handleInviteClick = async () => {
    if (!activeServer || !activeServer._id) return
    setInviteDialogOpen(true)
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
                  onClick={() => handleDmClick()}
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
                    onClick={(e) => { setActiveDmChat(null); setIsDmView(false); handleServerClick(server, e) }}
                  >
                    {server.name.slice(0, 1)}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{server.name}</TooltipContent>
              </Tooltip>
            ))}
            <Separator className="my-2 w-10" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="server-icon bg-muted hover:bg-green-600"
                  onClick={() => {
                    setCreateServerName("");
                    setCreateServerDialogOpen(true)
                  }}
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
            {isDmView ? <div>
              <input
                type="text"
                placeholder="Search"
                className="bg-[#202225] h-8 m-3 text-[#dcddde] flex items-center justify-between  px-2 py-1 rounded text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              />
              <Separator className="my-2  w-50" />
              {/* add users to chat here ... */}
              {/* List of DM Users */}
              <div className="px-2 space-y-2">
                {directMessages.map((user) => {
                  const isOnline = onlineUsers.includes(user._id);

                  return (
                    <button
                      key={user._id} // ✅ Ensures uniqueness
                      className="flex items-center w-full p-2 rounded-md hover:bg-[#2f3136] transition"
                      onClick={() => setActiveDmChat(user)}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={user.username} />
                          <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"></div>
                        )}
                      </div>

                      {/* Username */}
                      <div className="ml-3 flex flex-col text-left">
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                    </button>
                  );
                })}

              </div>
            </div> : activeChannel === null ? (
              <>
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
                  <div className="text-3xl font-bold text-white animate-fade-in">
                    Welcome <br /> to <br></br>SoulSync!
                  </div>
                  <p className="max-w-sm text-sm text-gray-300">
                    Choose a server from the sidebar or <br /> create a new one to start chatting.
                  </p>

                </div>
              </>
            ) :
              (
                <>
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
                        {loading ?
                          <div className="mt-4 space-y-3 animate-pulse">
                            {[...Array(4)].map((_, index) => (
                              <Skeleton key={index} className="h-6 w-40 rounded-md" />
                            ))}
                          </div> :
                          textChannels.map(channel => (
                            <SidebarMenuItem key={channel._id}>
                              <SidebarMenuButton
                                isActive={activeChannel._id === channel._id}
                                onClick={() => { handleChannelClick(channel) }}
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
                        {loading ?
                          <div className="mt-4 space-y-3 animate-pulse">
                            {[...Array(4)].map((_, index) => (
                              <Skeleton key={index} className="h-6 w-40 rounded-md" />
                            ))}
                          </div> :
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
                  <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center px-2 py-1">
                      <ChevronDown className="mr-1 h-3 w-3" />
                      RESOURCES
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {loading ?
                          <div className="mt-4 space-y-3 animate-pulse">
                            {[...Array(4)].map((_, index) => (
                              <Skeleton key={index} className="h-6 w-40 rounded-md" />
                            ))}
                          </div> :
                          resourcesChannels.map(channel => (
                            <SidebarMenuItem key={channel._id}>
                              <SidebarMenuButton
                                isActive={activeChannel._id === channel._id}
                                onClick={() => handleChannelClick(channel)}
                              >
                                <Folder className="mr-2 h-4 w-4" />
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
                          {serverMembers.map(member => {
                            // Check if the member is online
                            const isOnline = onlineUsers.includes(member._id);
                            return (
                              <SidebarMenuItem key={member._id}>
                                <SidebarMenuButton>
                                  <div className="relative mr-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={`/placeholder.svg?height=24&width=24`}
                                        alt={member.username.slice(0, 1)}
                                      />
                                      <AvatarFallback>{member.username.slice(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    {/* Show green tick for online users */}
                                    {isOnline && (
                                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"></div>
                                    )}
                                  </div>
                                  <span>{member.username}</span>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </div>
                  <SidebarRail />
                </>
              )
            }
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
                const serverName = createServerName;
                // Sanitize server name to prevent XSS and SQL injection attacks;
                const cleanedName = sanitizeServerName(serverName);
                const nameRegex = /^[a-zA-Z0-9\s-_]{3,32}$/;
                setError('')
                //  VALIDATION
                if (!cleanedName) {
                  setError("Server name cannot be empty.");
                  return;
                }
                if (cleanedName.length < 3) {
                  setError("Server name must be at least 3 characters.");
                  return;
                }
                if (!nameRegex.test(cleanedName)) {
                  setError("Only letters, numbers, spaces, dashes, and underscores are allowed.");
                  return;
                }
                if (cleanedName.length > 32) {
                  setError("Server name cannot exceed 32 characters.");
                  return;
                }
                setIsSubmitting(true);
                try {
                  const response = await fetch(`${backendUrl}/createServer`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cleanedName }),
                  })

                  if (!response.ok) {
                    const errorData = await response.json()
                    setError(errorData.message || "Failed to create server")
                    return;
                  }

                  const result = await response.json()
                  setCreateServerDialogOpen(false)
                  setServers((prevServers) => [...prevServers, result.server]);
                  setError('');
                } catch (error) {
                  setError("An error occurred while creating the server. Please try again.");
                }
                finally {
                  setIsSubmitting(false);
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
                    value={createServerName}
                    onChange={(e) => setCreateServerName(e.target.value)}
                    autoFocus
                    className="col-span-4"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-center font-medium" aria-live="polite">
                  {error}
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateServerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12zm2.5 0a5.5 5.5 0 1 0 11 0A5.5 5.5 0 0 0 6.5 12z"
                      />
                    </svg>
                  ) : (
                    "Create Server"
                  )}
                </Button>
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
                  const response = await fetch(`${backendUrl}/joinServer`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inviteUrl }),
                  })

                  if (!response.ok) throw new Error("Failed to join server")

                  const result = await response.json()
                  if (result.success) {
                    // Add the joined server to the list
                    setServers((newServer) => [...newServer, result.server])
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
