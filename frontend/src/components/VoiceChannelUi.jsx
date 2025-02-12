import { useState } from 'react';
import { Volume2, UserPlus, Settings, Phone, Video, Monitor, Mic, Headphones, PhoneOff } from 'lucide-react';

const VoiceChannelUI = ({ channelName = "General Voice" }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const connectedUsers = [
    { id: 1, name: "Alice", avatar: "A", isSpeaking: true, isMuted: false, isVideoOn: false },
    { id: 2, name: "Bob", avatar: "B", isSpeaking: false, isMuted: true, isVideoOn: false },
    { id: 3, name: "Charlie", avatar: "C", isSpeaking: false, isMuted: false, isVideoOn: true }
  ];

  return (
    <div className="flex flex-col h-full bg-[#36393f]">
      {/* Voice Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202225] shadow-sm">
        <div className="flex items-center space-x-2">
          <Volume2 size={24} className="text-[#8e9297]" />
          <span className="font-bold text-white">{channelName}</span>
        </div>
        <div className="flex items-center space-x-4 text-[#b9bbbe]">
          <button className="hover:text-[#dcddde]">
            <UserPlus size={20} />
          </button>
          <button className="hover:text-[#dcddde]">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Voice Channel Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedUsers.map((user) => (
            <div key={user.id} className="bg-[#2f3136] p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${user.isSpeaking ? 'bg-[#3ba55d]' : 'bg-[#5865f2]'}`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="flex items-center space-x-2 text-sm text-[#b9bbbe]">
                    {user.isSpeaking && <span className="text-[#3ba55d]">Speaking</span>}
                    {user.isMuted && <Mic className="w-4 h-4 text-red-500" />}
                    {user.isVideoOn && <Video className="w-4 h-4 text-[#3ba55d]" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="bg-[#292b2f] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg ${isMuted ? 'bg-red-500' : 'bg-[#36393f]'} hover:bg-[#4f545c]`}
            >
              <Mic size={20} className="text-white" />
            </button>
            <button
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-2 rounded-lg ${isDeafened ? 'bg-red-500' : 'bg-[#36393f]'} hover:bg-[#4f545c]`}
            >
              <Headphones size={20} className="text-white" />
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-lg ${isVideoOn ? 'bg-[#3ba55d]' : 'bg-[#36393f]'} hover:bg-[#4f545c]`}
            >
              <Video size={20} className="text-white" />
            </button>
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-2 rounded-lg ${isScreenSharing ? 'bg-[#3ba55d]' : 'bg-[#36393f]'} hover:bg-[#4f545c]`}
            >
              <Monitor size={20} className="text-white" />
            </button>
          </div>
          <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600">
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelUI;