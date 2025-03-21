"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import ChatBox from "./chatBox"
import VoiceChannelUI from "./voiceChannel"
import DM from "./DM"  // Import the DM component
import image from "../../assets/image-removebg-preview.png";
import { Skeleton } from "../ui/skeleton"

export default function ServerPage() {
  const [activeChannel, setActiveChannel] = useState(null); // Track selected channel
  const [activeDmChat, setActiveDmChat] = useState(null); // Track active DM
  const [user, setUser] = useState(null);
  const [activerServerData, setActiveServerData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchUserData();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen w-screen">
        {/* Sidebar Skeleton */}
        <div className="w-60 bg-gray-900 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col">
          {/* Header Skeleton */}
          <div className="h-12 bg-gray-800 px-4 flex items-center">
            <Skeleton className="h-8 w-8 rounded-full mr-3" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Chat Skeleton */}
          <div className="flex-1 p-4 space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-80" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        setActiveChannel={setActiveChannel}
        activeChannel={activeChannel}
        activeUser={user}
        setActiveDmChat={setActiveDmChat} // Pass DM handler to Sidebar
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeDmChat ? (
          <DM activeUser={user} selectedUser={activeDmChat} /> // Render DM UI
        ) : activeChannel ? (
          activeChannel.type === "text" ? (
            <ChatBox activeChannel={activeChannel} activeUser={user} />
          ) : (
            <VoiceChannelUI activeChannel={activeChannel} setActiveChannel={setActiveChannel} activerServerData={activerServerData} activeUser={user} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="mb-5">
              <img src={image} alt="" className="w-full h-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Select a channel or DM to communicate</h2>
            <p className="text-center mb-6 max-w-md">
              No channels or DMs are currently selected. Choose a channel from the sidebar or start a conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
