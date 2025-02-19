import { useState } from 'react';
import { Hash, UserPlus, Bell, Pin, Users, InboxIcon, HelpCircle, PlusCircle, Gift, Sticker, AArrowDown as GIF, Smile as EmojiSmile, Send } from 'lucide-react';

const ChannelUI = ({ channelName }) => {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      author: "Alice",
      avatar: "A",
      content: "Hey everyone! Welcome to the channel 👋",
      timestamp: "Today at 12:00 PM"
    },
    {
      id: 2,
      author: "Bob",
      avatar: "B",
      content: "Hi Alice! Thanks for creating this channel",
      timestamp: "Today at 12:05 PM"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202225] bg-[#36393f] shadow-sm">
        <div className="flex items-center space-x-2">
          <Hash size={24} className="text-[#8e9297]" style={{marginLeft : "40px"}}/>
          <span className="font-bold text-white ">{channelName}</span>
        </div>
        <div className="flex items-center space-x-4 text-[#b9bbbe]">
          
          
          <div className="">
            <input
              type="text"
              placeholder="Search"
              className="bg-[#202225] text-[#dcddde] px-2 py-1 rounded text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
          <button className="hover:text-[#dcddde]">
            <InboxIcon size={20} />
          </button>
          <button className="hover:text-[#dcddde]">
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#36393f]">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-4 group">
            <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white flex-shrink-0">
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{msg.author}</span>
                <span className="text-xs text-[#8e9297]">{msg.timestamp}</span>
              </div>
              <p className="text-[#dcddde] break-words">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 bg-[#36393f]">
        <div className="flex items-center">
         
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${channelName}`}
            className="w-full bg-[#40444b] text-[#dcddde] px-12 py-3 rounded-lg focus:outline-none"
          />
          <div className="flex right-4  items-center space-x-4">
            
            <button className="text-[#b9bbbe] hover:text-[#dcddde]">
              <EmojiSmile size={22} />
            </button>
            <button 
              onClick={handleSendMessage}
              className={`text-[#b9bbbe] hover:text-[#dcddde] ${message.trim() ? 'text-[#5865f2]' : ''}`}
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelUI;