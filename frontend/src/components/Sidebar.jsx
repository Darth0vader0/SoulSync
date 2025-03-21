import { useState } from "react";
import { Menu, X, Hash, Plus, Settings, Mic, Headphones, MessageSquare, Volume2 } from "lucide-react";
import { useEffect } from "react";
const Sidebar = ({setActiveChannel,activeUser,setActiveServerData}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [activeServer,setActiveServer] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const[channelName,setChannelName] =useState("");
  const[voiceChannelName,setVoiceChannelName] = useState("");
  const [error, setError] = useState("");
  const toggleSidebar = () => setIsOpen(!isOpen);

  const [servers, setServers] = useState([])
  
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
        
        setServers(result.servers);
      } catch (err) {
        setError(err.message);
      }
    };

  
  fetchServers();
  }, []);
// Run only when `servers` update


const [textChannels, setTextChannels] = useState([]);
const [voiceChannels, setVoiceChannels] = useState([]);



  const handleChannelClick = (channel) => {
    setSelectedChannel(channel._id); // Update selected channel UI
    setActiveChannel(channel); // Send to ServerPage.jsx
    toggleSidebar(); //
  };

  const handleActiveServer = async (server)=>{
    setActiveServer(server);
    setActiveServerData(server);
    setTextChannels([]);
    setVoiceChannels([]);
    try {
      const response = await fetch(`http://localhost:3001/getChannelsByServer?serverId=${server._id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      if (data.success) {
        // Separate channels into text and voice
        const text = data.channels.filter(channel => channel.type === "text");
        const voice = data.channels.filter(channel => channel.type === "voice");

        setActiveChannel(text[0])
        setTextChannels(text);
        setVoiceChannels(voice);
        toggleSidebar(); //
      } else {
        console.error("Error fetching channels:", data.message);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }
  
  useEffect(() => {
    
  }, [activeServer]);  

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
      setServers((prevServers) => [...prevServers, data.server]);

      // 🔹 Set the new server as active
      handleActiveServer(data.server);

      setServerName("");
    } catch (err) {
      setError("Failed to create server");
    }
        // 🔹 Call fetchServers again to update the list
  };

  const handleChannelCreation =async ()=>{
    if(!channelName){
      setError("Channel name is required");
      return;
    }
    const response = await fetch(`http://localhost:3001/createTextChannel?serverId=${activeServer._id}`,{
      method:"POST",
      credentials:"include",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({channelName:channelName})
    })
    if(!response.ok){
      setError("Failed to create channel");
      return;
    }
      document.getElementById("model2close").click();
      handleActiveServer(activeServer);
      setChannelName("");
  }

  const handleVoiceChannelCreation =async ()=>{
    
    if(!voiceChannelName){
      setError("Channel name is required");
      return;
    }
    const response = await fetch(`http://localhost:3001/createVoiceChannel?serverId=${activeServer._id}`,{
      method:"POST",
      credentials:"include",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({voiceChannelName:voiceChannelName})
    })
    if(!response.ok){
      setError("Failed to create voice channel");
      return;
    }else{
      document.getElementById("model1close").click();
      handleActiveServer(activeServer);
      setVoiceChannelName("")
    }

  }

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
              key={server._id}
              className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-white cursor-pointer hover:rounded-2xl transition-all duration-200"
              onClick={()=>handleActiveServer(server)}
            >
              {server.name.slice(0,1)}
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
                <button id="model3close" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#dcddde]">✕</button>
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
                <button className="hover:text-[#dcddde]" onClick={() => document.getElementById('my_modal_2')?.showModal() }>
                  <Plus size={16} />
                </button>
                <dialog id="my_modal_2" className="modal">
            <div className="modal-box bg-[#36393f] text-[#dcddde]">
              <form method="dialog">
                <button id="model2close" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#dcddde]" onClick={()=>{setChannelName("")}}>✕</button>
              </form>
              <h3 className="font-bold text-lg mb-4">Create a channerl</h3>
              <input
                type="text"
                placeholder="Enter channel  name"
                className="input input-bordered w-full bg-[#202225] text-[#dcddde] border-[#040405] focus:border-[#5865F2]"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mt-2"></p>}
              <button
                className="btn bg-[#5865F2] hover:bg-[#4752C4] text-white w-full mt-4"
                onClick={handleChannelCreation}
              >
                Create channel
              </button>
            </div>
          </dialog>
              </h2>
              <ul className="space-y-1">
                {textChannels.map((channel) => (
                  <li key={channel._id} > 
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
                <dialog id="my_modal_1" className="modal">
            <div className="modal-box bg-[#36393f] text-[#dcddde]">
              <form method="dialog">
                <button id='model1close' className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#dcddde]" onClick ={()=>{
                  setVoiceChannelName("")
                }}>✕</button>
              </form>
              <h3 className="font-bold text-lg mb-4">Create a voice channel</h3>
              <input
                type="text"
                placeholder="Enter channel name"
                className="input input-bordered w-full bg-[#202225] text-[#dcddde] border-[#040405] focus:border-[#5865F2]"
                value={voiceChannelName}
                onChange={(e) => setVoiceChannelName(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mt-2"></p>}
              <button
                className="btn bg-[#5865F2] hover:bg-[#4752C4] text-white w-full mt-4"
                onClick={handleVoiceChannelCreation}
              >
                Create channel
              </button>
            </div>
          </dialog>
              </h2>
              <ul className="space-y-1">
                {voiceChannels.map((channel) => (
                  <li key={channel._id}>
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
              {activeUser?activeUser.username.slice(0,1):''}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{activeUser?activeUser.username:''}</div>
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