import { useState } from "react";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import ChannelUI from "../components/ChannelUi";
import VoiceChannelUI from "../components/VoiceChannelUi";

const ServerPage = () => {
  const [activeChannel, setActiveChannel] = useState(null); // Track selected channel

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar manages channels and updates the active one */}
        <Sidebar setActiveChannel={setActiveChannel} />

        {/* Main Content - Switches between Text & Voice UI */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChannel ? (
            activeChannel.type === "text" ? (
              <ChannelUI channelName={activeChannel.name} />
            ) : (
              <VoiceChannelUI channelName={activeChannel.name} />
            )
          ) : (
            <p className="text-gray-400">Select a channel to start chatting</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ServerPage;
