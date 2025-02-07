"use client";

import { useState } from "react";
import { Menu, X, Hash, Plus, Settings, Mic, Headphones, MessageSquare } from "lucide-react";

 const  Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const servers = [
    { id: 1, name: "SoulSync", initial: "S" },
    { id: 2, name: "Gaming", initial: "G" },
    { id: 3, name: "Study Group", initial: "SG" },
  ];

  const textChannels = [
    { id: 1, name: "general" },
    { id: 2, name: "random" },
    { id: 3, name: "ideas" },
  ];

  const voiceChannels = [
    { id: 1, name: "General Voice" },
    { id: 2, name: "Gaming Voice" },
  ];

  const directMessages = [
    { id: 1, name: "Alice", status: "online" },
    { id: 2, name: "Bob", status: "idle" },
    { id: 3, name: "Charlie", status: "dnd" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Combined sidebar for mobile */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-full md:w-[332px] bg-[#202225] transition-transform duration-300 ease-in-out flex ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Server list */}
        <div className="w-[72px] bg-[#202225] pt-3 flex flex-col items-center space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-white cursor-pointer hover:rounded-2xl transition-all duration-200"
            >
              {server.initial}
            </div>
          ))}
          <div className="w-12 h-12 rounded-full bg-[#36393f] flex items-center justify-center text-white cursor-pointer hover:rounded-2xl transition-all duration-200">
            <Plus size={24} />
          </div>
        </div>

        {/* Channels sidebar */}
        <div className="flex-1 bg-[#2f3136] flex flex-col">
          {/* Server name */}
          <div className="flex items-center justify-between border-b border-[#202225] p-4">
            <h1 className="text-white font-bold">SoulSync</h1>
            <button className="text-[#b9bbbe] hover:text-[#dcddde]">
              <Menu size={18} />
            </button>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
            {/* Text Channels */}
            <div>
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase text-[#8e9297] px-2 mb-1">
                Text Channels
                <button className="text-[#8e9297] hover:text-[#dcddde]">
                  <Plus size={16} />
                </button>
              </h2>
              <ul className="space-y-1">
                {textChannels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={`#${channel.name}`}
                      className="flex items-center rounded px-2 py-1 text-[#8e9297] hover:bg-[#393c43] hover:text-[#dcddde]"
                    >
                      <Hash size={18} className="mr-2" />
                      {channel.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Voice Channels */}
            <div>
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase text-[#8e9297] px-2 mb-1">
                Voice Channels
                <button className="text-[#8e9297] hover:text-[#dcddde]">
                  <Plus size={16} />
                </button>
              </h2>
              <ul className="space-y-1">
                {voiceChannels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={`#${channel.name}`}
                      className="flex items-center rounded px-2 py-1 text-[#8e9297] hover:bg-[#393c43] hover:text-[#dcddde]"
                    >
                      <MessageSquare size={18} className="mr-2" />
                      {channel.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Messages */}
            <div>
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase text-[#8e9297] px-2 mb-1">
                Direct Messages
                <button className="text-[#8e9297] hover:text-[#dcddde]">
                  <Plus size={16} />
                </button>
              </h2>
              <ul className="space-y-1">
                {directMessages.map((dm) => (
                  <li key={dm.id}>
                    <a
                      href={`#${dm.name}`}
                      className="flex items-center rounded px-2 py-1 text-[#8e9297] hover:bg-[#393c43] hover:text-[#dcddde]"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          dm.status === "online"
                            ? "bg-green-500"
                            : dm.status === "idle"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      {dm.name}
                    </a>
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
                <div className="text-sm font-medium">Username</div>
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

      {/* Main content area */}
      <div className="md:ml-[332px] p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to SoulSync</h1>
        <p>Select a channel or direct message to start chatting!</p>
      </div>
    </>
  );
};


export default Sidebar;