"use client"

import { useState,useEffect } from "react"
import Sidebar from "./sidebar"
import ChatBox from "./chatBox"
import VoiceChannelUI from "./voiceChannel"
import image from "../../assets/image-removebg-preview.png";

export default function ServerPage() {
  const [activeChannel, setActiveChannel] = useState(); // Track selected channel
  const [user, setUser] = useState(null);
   const [activerServerData,setActiveServerData] = useState([])
   const [error, setError] = useState(null);

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
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        setActiveChannel={setActiveChannel}
        setActiveServerData={setActiveServerData}
        activeChannel={activeChannel}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
      {activeChannel ? (
            activeChannel.type === "text" ? (
              <ChatBox activeChannel={activeChannel} activeUser={user}  />
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
  )
}
