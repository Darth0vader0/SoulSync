import { useState ,useEffect} from "react";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import ChannelUI from "../components/ChannelUi";
import VoiceChannelUI from "../components/VoiceChannelUi";
import image from "../assets/image-removebg-preview.png";
const ServerPage = () => {
  const [activeChannel, setActiveChannel] = useState(null); // Track selected channel
  const [user, setUser] = useState(null);
   const [activerServerData,setActiveServerData] = useState([])
   const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("https://soulsync-52q9.onrender.com/getUserData", {
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
        <Sidebar setActiveChannel={setActiveChannel} setActiveServerData={setActiveServerData} activeUser={user}  />

        {/* Main Content - Switches between Text & Voice UI */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeChannel ? (
            activeChannel.type === "text" ? (
              <ChannelUI activeChannel={activeChannel} activeUser={user}  />
            ) : (
              <VoiceChannelUI activeChannel={activeChannel} setActiveChannel={setActiveChannel}  activerServerData={activerServerData} userId={user} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="mb-5">
             <img src={image} alt="" className="w-full h-auto"  />
            </div>
            <h2 className="text-2xl font-bold mb-2">select a channel to keep communicate</h2>
            <p className="text-center mb-6 max-w-md">
              No text or voice channels are currently selected. Choose a channel from the sidebar or start a conversation.
            </p>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ServerPage;
