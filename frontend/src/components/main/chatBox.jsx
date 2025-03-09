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

// Mock data

const mockMessages = [
  {
    id: "1",
    content: "Hey everyone! Welcome to the general channel 👋",
    timestamp: new Date(Date.now() - 3600000 * 2),
    user: {
      id: "1",
      name: "Jane Smith",
      avatar: "JS"
    }
  },
  {
    id: "2",
    content: "Thanks! Excited to be here. What's everyone working on?",
    timestamp: new Date(Date.now() - 3600000),
    user: {
      id: "2",
      name: "John Doe",
      avatar: "JD"
    }
  },
  {
    id: "3",
    content: "I'm building a new game. Check out this concept art:",
    timestamp: new Date(Date.now() - 1800000),
    user: {
      id: "3",
      name: "Alex Johnson",
      avatar: "AJ"
    },
    attachments: [
      {
        type: "image",
        url: "C:/Users/kamal/Desktop/Melodify/public/photos/kuru_.jpg",
        name: "concept-art.png"
      }
    ]
  },
  {
    id: "4",
    content: "That looks amazing! What engine are you using?",
    timestamp: new Date(Date.now() - 900000),
    user: {
      id: "1",
      name: "Jane Smith",
      avatar: "JS"
    }
  },
  {
    id: "5",
    content:
      "I'm using Unity. Here's the documentation link if anyone's interested:",
    timestamp: new Date(Date.now() - 600000),
    user: {
      id: "3",
      name: "Alex Johnson",
      avatar: "AJ"
    },
    attachments: [
      {
        type: "link",
        url: "https://unity.com/documentation",
        name: "Unity Documentation"
      }
    ]
  },
  {
    id: "6",
    content: "I've been learning React lately. It's pretty fun!",
    timestamp: new Date(Date.now() - 300000),
    user: {
      id: "2",
      name: "John Doe",
      avatar: "JD"
    }
  }
]

export default function ChatBox({ activeChannel }) {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = e => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      user: {
        id: "1", // Current user
        name: "Jane Smith",
        avatar: "JS"
      }
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const formatTime = date => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = date => {
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
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Channel header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Hash className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">{channel.name}</h2>
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
                      {message.attachments?.map((attachment, i) => (
                        <div key={i} className="mt-2 rounded-md">
                          {attachment.type === "image" && (
                            <img
                              src={attachment.url || "/placeholder.svg"}
                              alt={attachment.name || "Attachment"}
                              className="max-h-80 rounded-md"
                            />
                          )}
                          {attachment.type === "link" && (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center rounded-md border border-border p-2 text-primary hover:underline"
                            >
                              <span>{attachment.name || attachment.url}</span>
                            </a>
                          )}
                        </div>
                      ))}
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
                placeholder={`Message #${channel.name}`}
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
  )
}
