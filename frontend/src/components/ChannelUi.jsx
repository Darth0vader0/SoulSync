import { useState,useEffect ,useRef} from 'react';
import { Hash, UserPlus, Bell, Pin, Users, InboxIcon, HelpCircle, PlusCircle, Gift, Sticker, AArrowDown as GIF, Smile as EmojiSmile, Send } from 'lucide-react';
import io from 'socket.io-client';
import UserProfilePopup from './UserProfilePopup'
const socket = io('https://soulsync-52q9.onrender.com',{
  withCredentials: true,
  transports: ['websocket','polling'],

})
const ChannelUI = ({ activeChannel,activeUser}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] =useState([]);
  const messagesEndRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
   // Fetch previous messages on mount
   useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/getChannelMessages?channelId=${activeChannel._id}`);
        const data = await response.json();
        
        if (data.success) {
          setMessages(data.data);
        }else {
          console.error(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages(); 

    if (activeChannel._id) {
      // fetchMessages();
      socket.emit("joinChannel", activeChannel._id);
    }

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      console.log(newMessage)
      if(newMessage.channelId === activeChannel._id) { setMessages((prevMessages) => [...prevMessages, newMessage]);}
     
    });

    return () => socket.off("receiveMessage"); // Cleanup
  }, [activeChannel._id]);
  const handleSendMessage =async  () => {
    if (!message) return;
    // Create new message object
    const newMessage = {
      channelId : activeChannel._id,
      senderId: activeUser._id,
      senderUsername:activeUser.username,
      content: message,
    };

    // Send to Socket.io
    socket.emit("sendMessage", newMessage);
    const response = await fetch('http://localhost:3001/sendMessageToChannel',{
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        channelId: activeChannel._id,
      }),
    })
    if (!response.ok) {
      console.error('Failed to send message');
      return;
    }
    setMessage('');
    const responseData = await response.json();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleAvatarClick = (event, userId) => {
    const rect = event.target.getBoundingClientRect();
    setPopupPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setSelectedUser(userId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202225] bg-[#36393f] shadow-sm">
        <div className="flex items-center space-x-2">
          <Hash size={24} className="text-[#8e9297]" style={{marginLeft : "40px"}}/>
          <span className="font-bold text-white ">{activeChannel.name}</span>
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
          <div key={msg._id} className="flex items-start space-x-4 group">
            <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white flex-shrink-0"  onClick={(e) => handleAvatarClick(e, msg.senderId)}>
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{msg.senderUsername}</span>
                <span className="text-xs text-[#8e9297]">{msg.timestamp}</span>
              </div>
              <p className="text-[#dcddde] break-words">{msg.content}</p>
            </div>
          </div>
        ))}
      <div style={{ visibility: "hidden", height: "0px",opacity:'none',marginTop:'0px'}} ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 bg-[#36393f]">
        <div className="flex items-center">
         
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${activeChannel.name}`}
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
         {/* User Profile Popup */}
      {selectedUser && (
        <UserProfilePopup
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          position={popupPosition}
        />
      )}
      </div>
    </div>
  );
};

export default ChannelUI;