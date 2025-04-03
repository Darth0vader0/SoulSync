"use client";
import { useState, useRef, useEffect } from "react";

import {
  Paperclip,
  Send,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  File,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

// Format time to "hh:mm AM/PM"
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format date to "Today", "Yesterday", or "Month Day, Year"
const formatDate = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const givenDate = new Date(date);

  if (givenDate.toDateString() === today.toDateString()) return "Today";
  if (givenDate.toDateString() === yesterday.toDateString()) return "Yesterday";
  return givenDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Get the appropriate icon or preview for a file based on its extension
const getResourceIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase(); // Extract file extension

  if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext))
    return <Image className="h-5 w-5" />;
  if (["mp4", "mkv", "mov", "avi", "flv", "wmv", "webm"].includes(ext))
    return <FileVideo className="h-5 w-5" />;
  if (["mp3", "wav", "aac", "flac", "ogg"].includes(ext))
    return <FileAudio className="h-5 w-5" />;
  if (ext === "pdf") return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />; // Default icon for unknown types
};

function ResourceSharingBox({ activeUser, selectedChannel }) {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  // Remove the selected file
  const handleRemoveFile = () => setFile(null);

  // Handle sending a resource (text or file)
  const handleSendResource = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("sender", activeUser?._id || "currentUser");
    formData.append("chatId", selectedChannel?._id);
    formData.append("text", message);
    if (file) formData.append("file", file);

    let fileType = "other"; // Default file type
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase(); // Extract file extension
      if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(fileExtension)) {
        fileType = "image";
      } else if (["mp4", "mkv", "mov", "avi", "flv", "wmv", "webm"].includes(fileExtension)) {
        fileType = "mp4";
      } else if (["mp3", "wav", "aac", "flac", "ogg"].includes(fileExtension)) {
        fileType = "mp3";
      } else if (fileExtension === "pdf") {
        fileType = "pdf";
      }
    }
    formData.append("fileType", fileType); // Add fileType to the form data

    const tempResource = {
      id: Date.now().toString(),
      type: fileType, // Use the determined file type
      name: file ? file.name : "Message",
      senderName: activeUser?.username || "You",
      timestamp: new Date().toISOString(),
      imageUrl: file ? URL.createObjectURL(file) : null, // Temporary preview for images
      text: message,
      loading: true,
    };

    setResources((prev) => [...prev, tempResource]); // Add to UI immediately
    setMessage("");
    setFile(null);

    try {
      const response = await fetch("https://soulsync-52q9.onrender.com/sendAttachments", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload resource");

      // Update the resource with the server response
      setResources((prev) =>
        prev.map((r) =>
          r.id === tempResource.id
            ? {
              ...r,
              id: data._id,
              text: data.text,
              imageUrl: data.attachmentUrl || null,
              timestamp: data.createdAt,
              loading: false,
            }
            : r
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);
      setResources((prev) =>
        prev.map((r) =>
          r.id === tempResource.id
            ? { ...r, loading: false, error: true }
            : r
        )
      );
    }
    setLoading(false);
  };

  // Group resources by date
  const groupedResources = {};
  resources.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  resources.forEach((resource) => {
    const dateLabel = formatDate(resource.timestamp);
    if (!groupedResources[dateLabel]) groupedResources[dateLabel] = [];
    groupedResources[dateLabel].push(resource);
  });
  // Fetch previous messages for the selected channel
  const fetchMessages = async () => {
    if (!selectedChannel?._id) return;

    try {
      const response = await fetch(
        `https://soulsync-52q9.onrender.com/getAttachments?channelId=${selectedChannel._id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.messages.map((msg) => {
          const fileExtension = msg.attachmentUrl
            ? msg.attachmentUrl.split(".").pop().toLowerCase()
            : "";
          let type = "file"; // Default type

          // Determine the type based on the file extension
          if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(fileExtension)) {
            type = "image";
          } else if (
            ["mp4", "mkv", "mov", "avi", "flv", "wmv", "webm"].includes(fileExtension)
          ) {
            type = "video";
          } else if (["mp3", "wav", "aac", "flac", "ogg"].includes(fileExtension)) {
            type = "audio";
          } else if (fileExtension === "pdf") {
            type = "pdf";
          }

          return {
            id: msg._id,
            type, // Use the determined type
            name: msg.attachmentUrl || "Untitled",
            senderName: msg.sender?.username || "Unknown",
            timestamp: msg.createdAt,
            imageUrl: msg.attachmentUrl || null,
            text: msg.text,
            loading: false,
          };
        });
        setResources(formattedMessages);
      } else {
        console.error("Failed to fetch messages:", data.error);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch messages when the selected channel changes
  useEffect(() => {
    fetchMessages();
  }, [selectedChannel]);

  // Smooth scroll to the latest message
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Slight delay ensures UI is updated first
  }, [resources]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <h2 className="font-semibold">Shared Resources</h2>
        <span className="text-sm text-muted-foreground">
          {selectedChannel?.name || "General"}
        </span>
      </div>

      {/* Resource List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {Object.entries(groupedResources).map(([date, items]) => (
          <div key={date} className="mb-6">
            <div className="relative mb-4 flex items-center">
              <Separator className="flex-grow" />
              <span className="absolute left-1/2 -translate-x-1/2 bg-card px-2 text-xs">
                {date}
              </span>
            </div>
            {items.map((resource) => (

              <div key={resource.id} className="mb-4 flex hover:bg-muted p-2 rounded-lg">
                <Avatar className="mr-3 h-10 w-10 bg-primary/10">
                  <AvatarFallback>{
                    getResourceIcon(resource.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{resource.text || resource.name}</div>
                    {resource.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      resource.imageUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(resource.imageUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Shared by {resource.senderName} • {formatTime(resource.timestamp)}
                  </div>
                  {/* Display the image if available */}
                  {resource.type === "image" && resource.imageUrl && (
                    <img
                      src={resource.imageUrl}
                      alt={resource.name || "Uploaded image"}
                      className="mt-2 max-w-[200px] max-h-[200px] rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

  
      {/* Input Section */}
      <div className="border-t p-4">
        <form onSubmit={handleSendResource} className="flex flex-col gap-2">
          {file && (
            <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button" // Prevent this button from acting as a submit button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="h-5 w-5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                type="button" // Prevent this button from acting as a submit button
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById("file-upload").click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a resource or message..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevent default form submission
                  handleSendResource(e); // Trigger the send function
                }
              }}
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceSharingBox;