"use client"
import { useState, useRef, useEffect } from "react"
import {
  Smile,
  Paperclip,
  Image,
  Send
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export default function DmChatBox() {
    const activeUser ={
        _id : "821801dbi39"
    }
    const selectedUser ={
        _id : "810d1901138c"
    }
  const [messages, setMessages] = useState([
    { id: "1", content: "Hey there! 👋", senderId: selectedUser?._id },
    { id: "2", content: "Yo! How’s it going?", senderId: activeUser?._id },
    { id: "3", content: "All good! Just working on SoulSync. 🚀", senderId: selectedUser?._id },
    { id: "4", content: "Nice! Keep grinding. 💪", senderId: activeUser?._id }
  ])
  
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: activeUser?._id
    }

    setMessages((prevMessages) => [...prevMessages, message])
    setNewMessage("")
  }

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
          <div key={message.id} className={`mb-4 flex ${message.senderId === activeUser?._id ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start gap-3">
              {message.senderId !== activeUser?._id && (
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={selectedUser?.username} />
                  <AvatarFallback>{selectedUser?.username?.slice(0,1)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-2 rounded-lg ${message.senderId === activeUser?._id ? "bg-blue-600 text-white" : "bg-purple-400"}`}>
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
  )
}
