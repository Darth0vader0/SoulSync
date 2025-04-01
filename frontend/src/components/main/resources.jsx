"use client"
import { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Send,
  FileText,
  Image,
  Link,
  FileVideo,
  FileAudio,
  File,
  Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

// Format time (HH:MM)
const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

// Get appropriate icon based on resource type
const getResourceIcon = (type) => {
  switch (type) {
    case "document":
      return <FileText className="h-5 w-5" />;
    case "image":
      return <Image className="h-5 w-5" />;
    case "link":
      return <Link className="h-5 w-5" />;
    case "video":
      return <FileVideo className="h-5 w-5" />;
    case "audio":
      return <FileAudio className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

function ResourceSharingBox({ activeUser, selectedChannel }) {
  const messagesEndRef = useRef(null);
  const [newResource, setNewResource] = useState("");
  
  // Dummy resources data
  const [resources, setResources] = useState([
    {
      id: "1",
      type: "document",
      name: "Project Proposal.pdf",
      size: "2.4 MB",
      senderId: "user123",
      senderName: "Alex Johnson",
      timestamp: new Date(2025, 3, 1, 10, 30).toISOString()
    },
    {
      id: "2",
      type: "image",
      name: "Design Mockup.png",
      size: "1.7 MB",
      senderId: "user456",
      senderName: "Maria Garcia",
      timestamp: new Date(2025, 3, 1, 11, 45).toISOString()
    },
    {
      id: "3",
      type: "link",
      name: "https://example.com/resource",
      description: "Useful tutorial on React",
      senderId: "user123",
      senderName: "Alex Johnson",
      timestamp: new Date(2025, 2, 31, 15, 20).toISOString()
    },
    {
      id: "4",
      type: "video",
      name: "Team Meeting Recording.mp4",
      size: "45.2 MB",
      senderId: "user789",
      senderName: "John Smith",
      timestamp: new Date(2025, 2, 31, 16, 10).toISOString()
    },
    {
      id: "5",
      type: "document",
      name: "API Documentation.docx",
      size: "1.2 MB",
      senderId: "user456",
      senderName: "Maria Garcia",
      timestamp: new Date(2025, 2, 30, 9, 15).toISOString()
    },
    {
      id: "6",
      type: "audio",
      name: "Interview Notes.mp3",
      size: "12.5 MB",
      senderId: "user789",
      senderName: "John Smith",
      timestamp: new Date(2025, 2, 30, 14, 30).toISOString()
    }
  ]);

  // Handle Sending Resources
  const handleSendResource = (e) => {
    e.preventDefault();
    if (!newResource.trim()) return;
    
    // Create a new resource (dummy implementation)
    const resource = {
      id: Date.now().toString(),
      type: "document", // Default type
      name: newResource.trim(),
      size: "1.0 MB",
      senderId: activeUser?._id || "currentUser",
      senderName: activeUser?.username || "You",
      timestamp: new Date().toISOString()
    };

    setResources(prevResources => [...prevResources, resource]);
    setNewResource("");
  };

  // Group resources by date
  const groupedResources = [];
  let currentDate = "";

  // Sort resources by timestamp (newest first)
  const sortedResources = [...resources].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedResources.forEach((resource) => {
    const resourceDate = formatDate(resource.timestamp);
    if (resourceDate !== currentDate) {
      currentDate = resourceDate;
      groupedResources.push({
        date: resourceDate,
        resources: [resource],
      });
    } else {
      groupedResources[groupedResources.length - 1].resources.push(resource);
    }
  });

  // Scroll to bottom when new resources are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [resources]);

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <h2 className="font-semibold">Shared Resources</h2>
            <span className="ml-2 text-sm text-muted-foreground">
              {selectedChannel?.name || "General Channel"}
            </span>
          </div>
        </div>

        {/* Resources Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {groupedResources.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <div className="relative mb-4 flex items-center">
                <Separator className="flex-grow" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {group.date}
                </span>
              </div>

              {group.resources.map((resource) => (
                <div key={resource.id} className="mb-4 flex hover:bg-muted p-2 rounded-lg transition-colors">
                  <Avatar className="mr-3 h-10 w-10 bg-primary/10">
                    <AvatarFallback>{getResourceIcon(resource.type)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {resource.name}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        Shared by {resource.senderName} • {formatTime(new Date(resource.timestamp))}
                      </span>
                      {resource.size && (
                        <span className="ml-2">• {resource.size}</span>
                      )}
                    </div>
                    
                    {resource.description && (
                      <div className="mt-1 text-sm">
                        {resource.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Resource Upload/Share Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSendResource} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="Share a resource or link..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newResource.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ResourceSharingBox;