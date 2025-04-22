"use client";
import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Send
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import socket from "../../utils/socket";
import {
  encryptMessage,
  decryptMessage,
  loadPrivateKey,
  importPrivateKey,
  importPublicKey,
  decryptWithKey
} from "../../utils/crypto";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Format date (Today, Yesterday, or Full Date)
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
};

function DmChatBox({ activeUser, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [selectedUserPublicKey, setSelectedUserPublicKey] = useState(null);

  useEffect(() => {
    socket.emit("userConnectedToDm", activeUser._id);
  }, [activeUser._id]);

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch(`${backendUrl}/getPublicKey/${selectedUser._id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setSelectedUserPublicKey(data.publicKey);
      } catch (error) {
        console.error("Failed to fetch public key:", error);
      }
    };

    fetchPublicKey();
  }, [selectedUser._id]);

  useEffect(() => {
    const fetchAndDecryptMessages = async () => {
      try {
        const response = await fetch(`${backendUrl}/${activeUser._id}/${selectedUser._id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
    
        // Decrypt messages
        const privateKeyPEM = loadPrivateKey();
        const privateKey = await importPrivateKey(privateKeyPEM);
    
         const processed = await Promise.all(
          data.data.map( (msg, i) => {
            // If you sent it, just show the plaintext copy you kept client‑side
            if (msg.senderId === activeUser._id) {
              return Promise.resolve({ ...msg, message: msg.plaintext || msg.message });
            }

            // Otherwise it was encrypted to you—decrypt with your key
            return decryptWithKey(privateKey, msg.message)
              .then(plain => ({ ...msg, message: plain }))
              .catch(err => {
                console.error(`[DM][#${i}] decryption failed:`, err);
                return { ...msg, message: '[Decryption failed]' };
              });
          })
        );

        setMessages(processed);
      } catch (error) {
        console.error("Error fetching or decrypting messages:", error);
      }
    };

    fetchAndDecryptMessages();
  }, [activeUser, selectedUser]);

  useEffect(() => {
    setMessages([]); // Reset messages when switching users
    socket.emit("joinDm", selectedUser._id);

    const handleReceiveMessage = async (message) => {
      // Only add message if it's for the current chat
      if (
        (message.senderId === activeUser._id && message.receiverId === selectedUser._id) ||
        (message.senderId === selectedUser._id && message.receiverId === activeUser._id)
      ) {
        if (message.senderId !== activeUser._id) {
          const privateKeyPEM = loadPrivateKey();
          message.message = await decryptMessage(privateKeyPEM, message.message);
          setMessages((prevMessages) => [...prevMessages, message]);
      
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser, activeUser]);

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {
        if (!msg.read && msg.receiverId === activeUser._id) {
          socket.emit("messageRead", { messageId: msg._id, senderId: msg.senderId });
        }
      });
    }
  }, [messages, activeUser._id]);

  useEffect(() => {
    socket.on("messageReadUpdate", ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    return () => socket.off("messageReadUpdate");
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Sending Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserPublicKey) 
    {
      console.error("Message or public key is empty");
      return;

    }

    const messageContent = newMessage.trim();

    // Encrypt the message
    const encryptedMessage = await encryptMessage(selectedUserPublicKey, messageContent);

    const message = {
      id: Date.now().toString(),
      message: encryptedMessage,
      senderId: activeUser._id,
      receiverId: selectedUser._id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...message,
        message: messageContent, // Use plain text for the sender's view
      },
    ]);
    setNewMessage("");
    // Emit message through socket
    socket.emit("sendMessageInDm", message);
  };

  // Group messages by date
  const groupedMessages = [];
  let currentDate = "";

  messages.forEach((message) => {
    const messageDate = formatDate(message.timestamp);
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Chat Header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={selectedUser?.avatar || "/placeholder.svg?height=40&width=40"} alt={selectedUser?.username} />
              <AvatarFallback>{selectedUser?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="ml-2 font-semibold">{selectedUser?.username || "User"}</h2>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <div className="relative mb-4 flex items-center">
                <Separator className="flex-grow" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {group.date}
                </span>
              </div>

              {group.messages.map((message, index) => {
                const isLastSentMessage =
                  message.senderId === activeUser._id && index === group.messages.length - 1;

                return (
                  <div
                    key={message._id || message.id}
                    className={`mb-4 flex ${message.senderId === activeUser._id ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col items-end">
                      <div className="flex items-start gap-3">
                        {message.senderId !== activeUser._id && (
                          <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={selectedUser?.username} />
                            <AvatarFallback>{selectedUser?.username?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`p-3 rounded-2xl max-w-xs ${message.senderId === activeUser._id ? "bg-blue-600 text-white" : "bg-purple-400 text-white"}`}>
                          {message.message || message.content}
                        </div>
                      </div>

                      {/* Instagram-style read receipt */}
                      {isLastSentMessage && (
                        <div className="flex items-center mt-1 mr-2">
                          <span className="text-xs text-gray-500 mr-1">
                            {message.read ? "Seen" : "Sent"}
                          </span>
                          {message.read ? (
                            <Avatar className="h-3 w-3">
                              <AvatarImage
                                src={selectedUser?.profilePic || "/placeholder.svg?height=12&width=12"}
                                alt={selectedUser?.username}
                                className="h-full w-full object-cover"
                              />
                              <AvatarFallback>{selectedUser?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default DmChatBox;