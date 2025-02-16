import { useState } from "react";
import { Menu, X, Hash, Plus, Settings, Mic, Headphones, MessageSquare, Volume2 } from "lucide-react";
import { useEffect } from "react";
const Sidebar = ({setActiveChannel}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [error, setError] = useState("");
  const toggleSidebar = () => setIsOpen(!isOpen);

  const [servers, setServers] = useState([]);

  async function getServers() {
    try {
      const response = await fetch('/getServers', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }
  
      const data = await response.json(); // Convert response to JSON
      return data; // Return the data
    } catch (error) {
      console.error("Error fetching servers:", error);
      return null; // Return null if error occurs
    }
  }
  useEffect(() => {
    async function fetchServers() {
      const data = await getServers();
      if (data) {
        setServers(data);
      }
    }
    
    fetchServers();
  }, []);

  const textChannels = [
    { id: 1, name: "general", isActive: true ,type: "text"},
    { id: 2, name: "announcements", isActive: false, type: "text"},
    { id: 3, name: "off-topic", isActive: false, type: "text"}
  ];

  const voiceChannels = [
    { id: 1, name: "General Voice", users: ["Alice", "Bob"], isActive: false ,type:"voice"},
    { id: 2, name: "Gaming", users: ["Charlie"], isActive: false ,type:"voice"},
    { id: 3, name: "Music", users: [], isActive: false ,type:"voice"}
  ];
  
  const handleChannelClick = (channel) => {
    setSelectedChannel(channel.id); // Update selected channel UI
    setActiveChannel(channel); // Send to ServerPage.jsx
  };

  const handleCreateServer = async () => {
    if (!serverName) {
      setError("Server name is required");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/createServer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: serverName }),
      });

      if (!response.ok) throw new Error("Failed to create server");
      const data = await response.json();
      document.getElementById("my_modal_3")?.close();
      setServerName("");
    } catch (err) {
      setError("Failed to create server");
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-full bg-[#5865F2] text-white flex items-center justify-center hover:bg-[#4752C4] transition"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static left-0 top-0 h-screen w-[332px] bg-[#202225] transition-transform duration-300 ease-in-out flex ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Server list */}
        <div className="w-[72px] bg-[#202225] pt-3 flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-white cursor-pointer hover:rounded-2xl transition-all duration-200">
            {""}
          </div>
          {servers.map((server) => (
            <div
              key={server.id}
              className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-white cursor-pointer hover:rounded-2xl transition-all duration-200"
            >
              {server.initial}
            </div>
          ))}
          
          <button 
            className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-[#3ba55d] cursor-pointer hover:rounded-2xl hover:bg-[#3ba55d] hover:text-white transition-all duration-200" 
            onClick={() => document.getElementById('my_modal_3')?.showModal()}
          >
            <Plus size={20} />
          </button>

          {/* Server Creation Modal */}
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box bg-[#36393f] text-[#dcddde]">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#dcddde]">✕</button>
              </form>
              <h3 className="font-bold text-lg mb-4">Create a Server</h3>
              <input
                type="text"
                placeholder="Enter server name"
                className="input input-bordered w-full bg-[#202225] text-[#dcddde] border-[#040405] focus:border-[#5865F2]"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                className="btn bg-[#5865F2] hover:bg-[#4752C4] text-white w-full mt-4"
                onClick={handleCreateServer}
              >
                Create Server
              </button>
            </div>
          </dialog>
        </div>

        {/* Channels sidebar */}
        <div className="flex-1 bg-[#2f3136] flex flex-col">
          {/* Server name */}
          <div className="flex items-center justify-between border-b border-[#202225] p-4">
            <h1 className="text-white font-bold">Soul-Sync</h1>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
            {/* Text Channels */}
            <div>
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase text-[#8e9297] px-2 mb-1">
                Text Channels
                <button className="hover:text-[#dcddde]" onClick={() => document.getElementById('my_modal_2')?.showModal()}>
                  <Plus size={16} />
                </button>
              </h2>
              <ul className="space-y-1">
                {textChannels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={`#${channel.name}`}
                      className={`flex items-center rounded px-2 py-1 ${
                        channel.isActive 
                          ? 'bg-[#393c43] text-[#dcddde]' 
                          : 'text-[#8e9297] hover:bg-[#393c43] hover:text-[#dcddde]'
                      } group relative`}
                      onClick={()=>handleChannelClick(channel)}
                   >
                      <Hash size={18} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Voice Channels */}
            <div>
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase text-[#8e9297] px-2 mb-1">
                Voice Channels
                <button className="hover:text-[#dcddde]" onClick={() => document.getElementById('my_modal_1')?.showModal()}>
                  <Plus size={16} />
                </button>
              </h2>
              <ul className="space-y-1">
                {voiceChannels.map((channel) => (
                  <li key={channel.id}>
                    <div className="space-y-1">
                      <a
                        href={`#${channel.name}`}
                        className={`flex items-center rounded px-2 py-1 ${
                          channel.isActive 
                            ? 'bg-[#393c43] text-[#dcddde]' 
                            : 'text-[#8e9297] hover:bg-[#393c43] hover:text-[#dcddde]'
                        } group`}
                        onClick={()=>handleChannelClick(channel)}
                      >
                        <Volume2 size={18} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{channel.name}</span>
                      </a>
                      {channel.users.length > 0 && (
                        <div className="ml-9 space-y-1">
                          {channel.users.map((user, idx) => (
                            <div key={idx} className="flex items-center text-sm text-[#8e9297]">
                              <div className="w-2 h-2 rounded-full bg-[#3ba55d] mr-2"></div>
                              {user}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User area */}
          <div className="bg-[#292b2f] p-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white mr-2">
                U
              </div>
              <div>
                <div className="text-sm font-medium text-white">Username</div>
                <div className="text-xs text-[#b9bbbe]">#1234</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-[#b9bbbe] hover:text-[#dcddde]">
                <Mic size={16} />
              </button>
              <button className="text-[#b9bbbe] hover:text-[#dcddde]">
                <Headphones size={16} />
              </button>
              <button className="text-[#b9bbbe] hover:text-[#dcddde]">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;