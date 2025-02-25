import { useState } from "react";
import { UserPlus, MessageSquare, X } from "lucide-react";

const UserProfilePopup = ({ user, onClose, position }) => {
  const [note, setNote] = useState("");

  const statusColors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-500",
  };

  return (
    <div className="fixed z-50" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      <div className="bg-[#18191c] rounded-lg shadow-lg w-72">
        {/* Banner */}
        <div className="h-15 bg-gradient-to-b from-[#5865f2] to-[#3a42c0] rounded-t-lg"></div>
        
        {/* Profile Section */}
        <div className="relative px-4 pb-4">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          {/* Avatar & Status */}
          <div className="relative -mt-8 mb-3">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-4 border-[#18191c]"
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-[#18191c] ${statusColors[user.status]}`}></div>
          </div>

          {/* User Info */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-white">{user.displayName}</h3>
            <p className="text-[#b9bbbe]">@{user.username}</p>
          </div>

          {/* SoulSync ID */}
          <div className="border-t border-[#2f3136] pt-3 mb-3">
            <h4 className="text-xs font-semibold text-[#b9bbbe] uppercase mb-2">SoulSync ID</h4>
            <p className="text-white">{user.id}</p>
          </div>

          {/* Note Section */}
          <div className="border-t border-[#2f3136] pt-3 mb-3">
            <h4 className="text-xs font-semibold text-[#b9bbbe] uppercase mb-2">Note</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Click to add a note"
              className="w-full bg-[#2f3136] text-white rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-2 bg-[#5865f2] text-white py-2 px-4 rounded hover:bg-[#4752c4] transition-colors text-sm">
              <UserPlus size={16} />
              <span>Send Friend Request</span>
            </button>
            <button className="flex items-center justify-center bg-[#4f545c] text-white py-2 px-4 rounded hover:bg-[#5d6269] transition-colors">
              <MessageSquare size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePopup;
