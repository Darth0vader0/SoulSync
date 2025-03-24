"use client"
import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Send
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import socket from "../../utils/socket";

export default function DmChatBox({ activeUser, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeUser?._id || !selectedUser?._id) return;

    // Connect to socket & join DM room
    socket.connect();
    socket.emit("joinDm", { userId: activeUser._id });

    // Receive real-time messages
    socket.on("receiveDmMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveDmMessage");
      socket.disconnect();
    };
  }, [activeUser, selectedUser]);

  // Handle Sending Messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: activeUser._id,
      receiverId: selectedUser._id,
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");

    // Send message via socket
    socket.emit("sendDmMessage", message);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={selectedUser?.username} />
            <AvatarFallback>{selectedUser?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="ml-2 font-semibold">{selectedUser?.username || "User"}</h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.senderId === activeUser._id ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start gap-3">
              {message.senderId !== activeUser._id && (
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={selectedUser?.username} />
                  <AvatarFallback>{selectedUser?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-2 rounded-lg ${message.senderId === activeUser._id ? "bg-blue-600 text-white" : "bg-purple-400 text-white"}`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message @${selectedUser?.username || "User"}`}
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
