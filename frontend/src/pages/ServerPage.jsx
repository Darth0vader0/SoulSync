import { useState ,useEffect} from "react";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import ChannelUI from "../components/ChannelUi";
import VoiceChannelUI from "../components/VoiceChannelUi";

const ServerPage = () => {
  const [activeChannel, setActiveChannel] = useState(null); // Track selected channel
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:3001/getUserData", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch user data");

        setUser(data.user);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar manages channels and updates the active one */}
        <Sidebar setActiveChannel={setActiveChannel} activeUser={user}  />

        {/* Main Content - Switches between Text & Voice UI */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChannel ? (
            activeChannel.type === "text" ? (
              <ChannelUI activeChannel={activeChannel} activeUser={user}  />
            ) : (
              <VoiceChannelUI activeChannel={activeChannel} />
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
