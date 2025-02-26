import { useState, useEffect } from "react";
import { UserPlus, MessageSquare, X } from "lucide-react";

const UserProfilePopup = ({ userId, onClose, position }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");

  const statusColors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-500",
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/getUser?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div className="fixed z-50 p-4 bg-gray-800 text-white rounded-lg">Loading...</div>;
  }

  if (error) {
    return <div className="fixed z-50 p-4 bg-red-600 text-white rounded-lg">{error}</div>;
  }

  return (
    <div className="fixed z-50" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      <div className="bg-[#18191c] rounded-lg shadow-lg w-72">
        {/* Banner */}
        <div className="h-15 bg-gradient-to-b from-[#5865f2] to-[#3a42c0] rounded-t-lg"></div>

        {/* Profile Section */}
        <div className="relative px-4 pb-4">
          {/* Close Button */}
          <button onClick={onClose} className="bg-gray-50 absolute top-2 right-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          {/* Avatar & Status */}
          <div className="relative -mt-8 mb-3">
            <img
              src={user.avatar || "https://imgs.search.brave.com/Ria0Hao4XAKVkVtfsXGsfAmEyf2jx2m8HyaEJ5TFrNw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmlt/Z2ZsaXAuY29tLzIv/NWtoZDNuLmpwZw"}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-4 border-[#18191c]"
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-[#18191c] ${statusColors[user.status]}`}></div>
          </div>

          {/* User Info */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-white">{user.username}</h3>
            <p className="text-[#b9bbbe]">@{user.username}</p>
          </div>

          {/* SoulSync ID */}
          <div className="border-t border-[#2f3136] pt-3 mb-3">
            <h4 className="text-xs font-semibold text-[#b9bbbe] uppercase mb-2">SoulSync ID</h4>
            <p className="text-white">{user._id}</p>
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
