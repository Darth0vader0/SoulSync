"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import ChatBox from "./chatBox"
import VoiceChannelUI from "./voiceChannel"

export default function ServerPage() {
  const [activeChannel, setActiveChannel] = useState({
    id: "general",
    name: "general",
    type: "text"
  })

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        onChannelSelect={setActiveChannel}
        activeChannel={activeChannel}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeChannel.type === "text" ? (
          <ChatBox channel={activeChannel} />
        ) : (
          <VoiceChannelUI channel={activeChannel} />
        )}
      </div>
    </div>
  )
}
