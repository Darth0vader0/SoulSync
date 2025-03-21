"use client"
import { useState, useRef, useEffect } from "react"
import {
  Smile,
  Paperclip,
  Image,
  Send,
  Gift,
  AtSign,
  Hash,
  Info,
  ChevronUp
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "../ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "../ui/dropdownMenu"

import { Skeleton } from "../ui/skeleton"

import socket from "../../utils/socket"

export default function ChatBox({ activeChannel,activeUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)
  const [loading , setLoading] = useState(false)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
 

   useEffect(() => {
      const fetchMessages = async () => {
        setLoading(true)
        try {
          const response = await fetch(`https://soulsync-52q9.onrender.com/getChannelMessages?channelId=${activeChannel._id}`);
          const data = await response.json();
          
          if (data.success) {
            const formattedMessage = data.data.map((message) => ({
              id: message._id.toString(),
              content: message.content,
              timestamp: new Date(message.timestamp),
              user: {
                id: message.senderId.toString(),
                name: message.senderUsername,
                avatar: message.senderUsername.charAt(0).toUpperCase(),
              },
              // Keep attachments if present in the response
              attachments: message.attachments ? message.attachments : undefined,
            }))
         
            setMessages(formattedMessage);
          }else {
            console.error(data)
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }finally{
          setTimeout(()=>{
            setLoading(false)
          },1000)
        }
      };
      fetchMessages(); 
      if (activeChannel._id) {
        socket.emit("joinChannel", activeChannel._id);
      }
  
    
  
    }, [activeChannel._id]);

    useEffect(()=>{
     // Listen for incoming messages
     socket.on("receiveMessage", (newMessage) => {
    
      const soketMessage = {
        id: Date.now().toString(),
        content: newMessage.content,
        timestamp: new Date(),
        user: {
          id: newMessage.senderId, // Current user
          name: newMessage.senderUsername,
          avatar: newMessage.senderUsername.slice(0,1)
        }
      }
      if(newMessage.channelId === activeChannel._id) { setMessages((prevMessages) => [...prevMessages, soketMessage])}
     
    });

    return () => socket.off("receiveMessage"); // Cleanup
  

    })

  useEffect(() => {
    if (!loading) {
      scrollToBottom() // Scroll only when loading is false
    }
    }, [messages,loading])


    
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      user: {
        id: activeUser._id, // Current user
        name: activeUser.username,
        avatar: activeUser.username.slice(0,1)
      }
    }
    setNewMessage("")

    socket.emit("sendMessage", {
      channelId : activeChannel._id,
      senderId: activeUser._id,
      senderUsername:activeUser.username,
      content: newMessage,
    });

     const response = await fetch('https://soul-sync-omega.vercel.app/sendMessageToChannel',{
       method: 'POST',
       credentials: 'include',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         content: newMessage,
         channelId: activeChannel._id,
       }),
     })
     if (!response.ok) {
       console.error('Failed to send message');
       return;
     }
  }

  const formatTime = date => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = date => {
    if (!(date instanceof Date)) {
      date = new Date(date); // Convert to Date object if it's a string
    }
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    }
  }

  // Group messages by date
  const groupedMessages = []
  let currentDate = ""

  messages.forEach(message => {
    const messageDate = formatDate(message.timestamp)

    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({
        date: messageDate,
        messages: [message]
      })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message)
    }
  })

  return (
    <>{

    loading ?
    <div className="flex flex-col p-4 space-y-4 animate-pulse">
    {/* Simulating multiple chat messages */}
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-start gap-3">
        {/* Avatar Skeleton */}
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          {/* Username Line */}
          <Skeleton className="h-4 w-32" />
          {/* Message Lines */}
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
    ))}
  </div> :
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Channel header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Hash className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">{activeChannel.name}</h2>
          </div>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <div className="relative mb-4 flex items-center">
                <Separator className="flex-grow" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {group.date}
                </span>
              </div>

              {group.messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40`}
                        alt={message.user.name}
                      />
                      <AvatarFallback>{message.user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <span className="mr-2 font-semibold">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1">{message.content}</p>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={`Message #${activeChannel.name}`}
                className="pr-12 md:pr-24"
              />
              {/* Desktop actions - visible on larger screens */}
              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 md:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mention</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gift</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload Image</TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile actions - dropdown menu for smaller screens */}
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top" className="w-48">
                    <DropdownMenuItem>
                      <AtSign className="mr-2 h-4 w-4" />
                      <span>Mention</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Smile className="mr-2 h-4 w-4" />
                      <span>Emoji</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Gift className="mr-2 h-4 w-4" />
                      <span>Gift</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Image className="mr-2 h-4 w-4" />
                      <span>Upload Image</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button type="submit" size="icon" className="shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </TooltipProvider>
}
    </>
  )
}
