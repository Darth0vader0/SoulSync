"use client"
import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Headphones,
  Volume2,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Settings,
  Users
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "../ui/tooltip"
import { Slider } from "../ui/slider"
import socket from "../../utils/socket"

export default function VoiceChannelUI({ activeChannel, activerServerData, setActiveChannel, activeUser }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [volume, setVolume] = useState([50])

  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentChannel, setCurrentChannel] = useState(null)
  
  // WebRTC state
  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef({}) // { socketId: RTCPeerConnection }
  const audioContextRef = useRef(null)
  const audioOutputsRef = useRef({}) // { userId: { gainNode, audioElement } }
  
  // Create container for audio elements
  useEffect(() => {
    // Create a container for audio elements if it doesn't exist
    let audioContainer = document.getElementById('audio-container')
    if (!audioContainer) {
      audioContainer = document.createElement('div')
      audioContainer.id = 'audio-container'
      audioContainer.style.display = 'none'
      document.body.appendChild(audioContainer)
    }
    
    return () => {
      // Clean up the container when component unmounts
      if (audioContainer && document.body.contains(audioContainer)) {
        document.body.removeChild(audioContainer)
      }
    }
  }, [])
  
  // Initialize audio context with user interaction
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        console.log("AudioContext initialized:", audioContextRef.current.state)
        
        // Resume the audio context if it's suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            console.log("AudioContext resumed:", audioContextRef.current.state)
          }).catch(err => {
            console.error("Failed to resume AudioContext:", err)
          })
        }
      }
    }
    
    // Set up event listeners for user interaction
    const userInteractionEvents = ['click', 'touchstart', 'keydown']
    const handleUserInteraction = () => {
      initAudioContext()
      
      // Remove event listeners after first interaction
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
    
    // Add event listeners
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })
    
    return () => {
      // Clean up event listeners
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
      
      // Close audio context when component unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          console.log("AudioContext closed")
        }).catch(err => {
          console.error("Failed to close AudioContext:", err)
        })
        audioContextRef.current = null
      }
    }
  }, [])

  // Create user audio element and gain node
  const createAudioOutput = (userId) => {
    if (audioOutputsRef.current[userId]) return audioOutputsRef.current[userId]
    
    console.log(`Creating audio output for user ${userId}`)
    
    // Create audio element
    const audioElement = new Audio()
    audioElement.id = `audio-${userId}`
    audioElement.autoplay = true
    
    // Add to DOM for it to work properly
    const audioContainer = document.getElementById('audio-container')
    if (audioContainer) {
      audioContainer.appendChild(audioElement)
    } else {
      // Fallback - append to body
      document.body.appendChild(audioElement)
    }
    if (audioContextRef.current) {
      audioContextRef.current.resume().catch(err => console.error("Failed to resume AudioContext:", err));
    }
    
    // Create gain node if audio context exists
    let gainNode = null
    if (audioContextRef.current) {
      gainNode = audioContextRef.current.createGain()
      gainNode.gain.value = volume[0] / 100
    }
    
    audioOutputsRef.current[userId] = { gainNode, audioElement }
    return audioOutputsRef.current[userId]
  }
  
  // Handle volume changes
  useEffect(() => {
    Object.values(audioOutputsRef.current).forEach(({ gainNode, audioElement }) => {
      if (gainNode) {
        gainNode.gain.value = volume[0] / 100
      }
      // Also set the volume on the audio element as fallback
      if (audioElement) {
        audioElement.volume = volume[0] / 100
      }
    })
  }, [volume])

  // Setup WebRTC media stream
  const setupLocalStream = async () => {
    try {
      console.log("Setting up local stream with constraints:", { audio: true, video: hasVideo })
      const constraints = { audio: true, video: hasVideo }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log("Got local stream:", stream)
      console.log("Local stream tracks:", stream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        muted: t.muted,
        id: t.id,
        label: t.label
      })))
      
      // Store the stream
      localStreamRef.current = stream
      
      // Set initial mute state based on UI
      stream.getAudioTracks().forEach(track => {
        
        console.log(`Setting audio track ${track.id} enabled: ${!isMuted}`)
        track.enabled = !isMuted
      })
      
      // Set initial video state based on UI (if video is enabled)
      if (hasVideo) {
        stream.getVideoTracks().forEach(track => {
          console.log(`Setting video track ${track.id} enabled: ${hasVideo}`)
          track.enabled = hasVideo
        })
      }
      
      return stream
    } catch (err) {
      console.error("Error accessing media devices:", err)
      return null
    }
  }
  
  // Create a new RTCPeerConnection for a remote peer
  const createPeerConnection = (remotePeerId, isInitiator = false) => {
    if (peerConnectionsRef.current[remotePeerId]) return peerConnectionsRef.current[remotePeerId]
    
    console.log(`Creating peer connection with ${remotePeerId}`, isInitiator ? '(as initiator)' : '')
    
    // RTCPeerConnection configuration (STUN/TURN servers)
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
        // Add TURN servers for production
      ]
    }
    
    const peerConnection = new RTCPeerConnection(configuration)
    
    // Add local stream tracks to the connection
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks()
      console.log(`Adding ${tracks.length} local tracks to peer connection:`, 
        tracks.map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id })))
      
      tracks.forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current)
      })
    } else {
      console.warn("No local stream available when creating peer connection")
    }
    
    // Log negotiation needed events
    peerConnection.onnegotiationneeded = (event) => {
      console.log(`Negotiation needed for connection with ${remotePeerId}`)
      if (isInitiator) {
        createAndSendOffer(remotePeerId, peerConnection)
      }
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to ${remotePeerId}:`, event.candidate.candidate.substring(0, 50) + '...')
        socket.emit('webrtc-ice-candidate', {
          target: remotePeerId,
          candidate: event.candidate
        })
      }
    }
    
    // Log ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${remotePeerId}:`, peerConnection.iceConnectionState)
    }
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${remotePeerId}:`, peerConnection.connectionState)
      
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed') {
        cleanupPeerConnection(remotePeerId)
      }
    }
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log(`Received track from ${remotePeerId}:`, event.track.kind, event.track)
      console.log("Track settings:", event.track.getSettings())
      console.log("Track enabled:", event.track.enabled)
      
      if (event.track.kind === 'audio') {
        const remoteUser = connectedUsers.find(user => user.socketId === remotePeerId)
        if (!remoteUser) {
          console.warn(`Received track from unknown user with socket ID ${remotePeerId}`)
          return
        }
        
        const userId = remoteUser.id
        
        // Create a MediaStream for this track
        const remoteStream = new MediaStream([event.track])
        
        // Use the HTML Audio element approach for compatibility
        const { audioElement } = createAudioOutput(userId)
        audioElement.srcObject = remoteStream
        
        // Ensure audio is playing
        audioElement.play().then(() => {
          console.log(`Audio playing for user ${userId}`)
        }).catch(err => {
          console.error(`Failed to play audio for user ${userId}:`, err)
          
          // Try to automatically resume audio context if this fails
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(err => {
              console.error("Failed to resume audio context:", err)
            })
          }
        })
        
        // Set up audio analysis for speaking detection
        if (audioContextRef.current) {
          const analyser = audioContextRef.current.createAnalyser()
          analyser.fftSize = 256
          
          // Create a media stream source from the remote stream
          const audioSource = audioContextRef.current.createMediaStreamSource(remoteStream)
          audioSource.connect(analyser)
          
          const bufferLength = analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          
          // Check for voice activity
          const checkVoiceActivity = () => {
            if (!remoteUser) return
            
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i]
            }
            
            const average = sum / bufferLength
            const isSpeaking = average > 20 // Threshold for speaking
            
            // Update UI if speaking state changes
            setConnectedUsers(prev => prev.map(user => 
              user.id === userId ? { ...user, isSpeaking } : user
            ))
            
            // Continue checking if the connection is still active
            if (peerConnectionsRef.current[remotePeerId]) {
              requestAnimationFrame(checkVoiceActivity)
            }
          }
          
          checkVoiceActivity()
        }
      }
    }
    
    // Store the peer connection
    peerConnectionsRef.current[remotePeerId] = peerConnection
    
    // If we're the initiator, create and send an offer
    if (isInitiator) {
      createAndSendOffer(remotePeerId, peerConnection)
    }
    
    return peerConnection
  }
  
  // Create and send WebRTC offer
  const createAndSendOffer = async (remotePeerId, peerConnection) => {
    try {
      console.log(`Creating offer for ${remotePeerId}`)
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      
      console.log(`Setting local description for ${remotePeerId}`)
      await peerConnection.setLocalDescription(offer)
      
      console.log(`Sending offer to ${remotePeerId}`)
      socket.emit('webrtc-offer', {
        target: remotePeerId,
        offer: offer,
        from: socket.id
      })
    } catch (err) {
      console.error("Error creating offer:", err)
    }
  }
  
  // Handle WebRTC signaling
  useEffect(() => {
    // Handle existing users in the channel
    socket.on('existingUsers', async (users) => {
      console.log('Existing users in channel:', users)
      
      if (!localStreamRef.current) {
        console.log("Setting up local stream for existing users")
        await setupLocalStream()
      }
      
      // Create peer connections with existing users
      users.forEach(user => {
        createPeerConnection(user.socketId, true) // We initiate the connection
      })
    })
    
    // Handle new user joining
    socket.on('newUserJoined', async (user) => {
      console.log('New user joined:', user)
      
      if (!localStreamRef.current) {
        console.log("Setting up local stream for new user")
        await setupLocalStream()
      }
      
      // Wait for the new user to set up, they will send us an offer
    })
    
    // Handle WebRTC offer
    socket.on('webrtc-offer', async ({ offer, from }) => {
      console.log('Received WebRTC offer from:', from)
      
      if (!localStreamRef.current) {
        console.log("Setting up local stream in response to offer")
        await setupLocalStream()
      }
      
      const peerConnection = createPeerConnection(from)
      
      try {
        console.log(`Setting remote description from ${from}`)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        
        console.log(`Creating answer for ${from}`)
        const answer = await peerConnection.createAnswer()
        
        console.log(`Setting local description (answer) for ${from}`)
        await peerConnection.setLocalDescription(answer)
        
        console.log(`Sending answer to ${from}`)
        socket.emit('webrtc-answer', {
          target: from,
          answer: answer
        })
      } catch (err) {
        console.error("Error handling offer:", err)
      }
    })
    
    // Handle WebRTC answer
    socket.on('webrtc-answer', async ({ answer, from }) => {
      console.log('Received WebRTC answer from:', from)
      
      const peerConnection = peerConnectionsRef.current[from]
      if (peerConnection) {
        try {
          console.log(`Setting remote description (answer) from ${from}`)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
          console.error("Error handling answer:", err)
        }
      } else {
        console.warn(`Received answer from ${from} but no peer connection exists`)
      }
    })
    
    // Handle ICE candidates
    socket.on('webrtc-ice-candidate', ({ candidate, from }) => {
      console.log(`Received ICE candidate from ${from}:`, candidate.candidate?.substring(0, 50) + '...')
      
      const peerConnection = peerConnectionsRef.current[from]
      if (peerConnection) {
        try {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log(`Added ICE candidate from ${from}`))
          .catch(err => console.error(`Error adding ICE candidate from ${from}:`, err))
        } catch (err) {
          console.error("Error adding ICE candidate:", err)
        }
      } else {
        console.warn(`Received ICE candidate from ${from} but no peer connection exists`)
      }
    })
    
    // Handle user leaving
    socket.on('userLeft', ({ userId, socketId }) => {
      console.log('User left:', userId, socketId)
      cleanupPeerConnection(socketId)
      
      // Remove audio elements
      if (audioOutputsRef.current[userId]) {
        const { audioElement } = audioOutputsRef.current[userId]
        if (audioElement && audioElement.parentNode) {
          audioElement.srcObject = null
          audioElement.parentNode.removeChild(audioElement)
        }
        delete audioOutputsRef.current[userId]
      }
    })
    
    // Handle mute/unmute status
    socket.on('user-audio-status', ({ userId, isMuted }) => {
      console.log(`User ${userId} ${isMuted ? 'muted' : 'unmuted'} their microphone`)
      setConnectedUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isMuted } : user
      ))
    })
    
    // Handle updated user list
    socket.on('userList', (users) => {
      console.log('Updated user list:', users)
      setConnectedUsers(users)
    })
    
    // Cleanup function
    return () => {
      socket.off('existingUsers')
      socket.off('newUserJoined')
      socket.off('webrtc-offer')
      socket.off('webrtc-answer')
      socket.off('webrtc-ice-candidate')
      socket.off('userLeft')
      socket.off('user-audio-status')
      socket.off('userList')
    }
  }, [])
  
  // Handle joining/leaving voice channels
  useEffect(() => {
    if (!activeUser || !activeChannel) return
    
    // If the user is switching channels, leave the previous one first
    if (currentChannel && currentChannel !== activeChannel._id) {
      console.log(`Leaving previous channel ${currentChannel}`)
      socket.emit('leaveVoiceChannel', { user: activeUser })
      cleanupAllConnections()
    }
    
    // Set up local stream and join the channel
    const initializeConnection = async () => {
      console.log(`Initializing connection for channel ${activeChannel._id}`)
      const stream = await setupLocalStream()
      
      if (stream) {
        // Join the new channel
        console.log(`Joining voice channel ${activeChannel._id}`)
        socket.emit('joinVoiceChannel', { channelId: activeChannel._id, user: activeUser })
        setCurrentChannel(activeChannel._id)
      } else {
        console.error("Failed to get local stream, cannot join channel")
      }
    }
    
    initializeConnection()
    
    // Handle disconnect (tab close, refresh)
    const handleBeforeUnload = () => {
      socket.emit('leaveVoiceChannel', { user: activeUser })
      cleanupAllConnections()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [activeChannel, activeUser])
  
  // Handle mute state changes
  useEffect(() => {
    if (localStreamRef.current) {
      console.log(`Setting local audio tracks enabled: ${!isMuted}`)
      
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted
      })
      
      // Inform other users about mute status
      console.log(`Emitting audio status change: muted = ${isMuted}`)
      socket.emit('audio-status-change', { isMuted })
    }
  }, [isMuted])
  
  // Handle video state changes
  useEffect(() => {
    async function updateVideoState() {
      if (hasVideo && !localStreamRef.current?.getVideoTracks().length) {
        // Add video track if not present
        try {
          console.log("Adding video track to local stream")
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
          const videoTrack = videoStream.getVideoTracks()[0]
          
          if (videoTrack && localStreamRef.current) {
            localStreamRef.current.addTrack(videoTrack)
            
            // Add new track to all peer connections
            Object.values(peerConnectionsRef.current).forEach(pc => {
              pc.getSenders().forEach(sender => {
                if (sender.track?.kind === 'video') {
                  sender.replaceTrack(videoTrack)
                } else if (!sender.track || sender.track.kind !== 'video') {
                  pc.addTrack(videoTrack, localStreamRef.current)
                }
              })
            })
          }
        } catch (err) {
          console.error("Error adding video track:", err)
          setHasVideo(false)
        }
      } else if (!hasVideo && localStreamRef.current) {
        // Remove video tracks if present
        console.log("Removing video tracks from local stream")
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.stop()
          localStreamRef.current.removeTrack(track)
        })
        
        // Update peer connections
        Object.values(peerConnectionsRef.current).forEach(pc => {
          pc.getSenders().forEach(sender => {
            if (sender.track?.kind === 'video') {
              pc.removeTrack(sender)
            }
          })
        })
      }
    }
    
    updateVideoState()
  }, [hasVideo])
  
  // Handle deafened state changes
  useEffect(() => {
    // When deafened, mute all incoming audio
    Object.values(audioOutputsRef.current).forEach(({ audioElement, gainNode }) => {
      if (audioElement) {
        audioElement.muted = isDeafened
      }
      
      if (gainNode) {
        gainNode.gain.value = isDeafened ? 0 : volume[0] / 100
      }
    })
  }, [isDeafened, volume])
  
  // Clean up a specific peer connection
  const cleanupPeerConnection = (peerId) => {
    console.log(`Cleaning up peer connection with ${peerId}`)
    const peerConnection = peerConnectionsRef.current[peerId]
    if (peerConnection) {
      peerConnection.ontrack = null
      peerConnection.onicecandidate = null
      peerConnection.oniceconnectionstatechange = null
      peerConnection.onconnectionstatechange = null
      peerConnection.onnegotiationneeded = null
      
      peerConnection.close()
      delete peerConnectionsRef.current[peerId]
    }
  }
  
  // Clean up all peer connections
  const cleanupAllConnections = () => {
    console.log("Cleaning up all connections")
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`)
        track.stop()
      })
      localStreamRef.current = null
    }
    
    Object.keys(peerConnectionsRef.current).forEach(cleanupPeerConnection)
    peerConnectionsRef.current = {}
    
    // Clean up audio outputs
    Object.entries(audioOutputsRef.current).forEach(([userId, { audioElement }]) => {
      console.log(`Cleaning up audio for user ${userId}`)
      if (audioElement) {
        if (audioElement.srcObject) {
          audioElement.srcObject.getTracks().forEach(track => track.stop())
          audioElement.srcObject = null
        }
        
        if (audioElement.parentNode) {
          audioElement.parentNode.removeChild(audioElement)
        }
      }
    })
    audioOutputsRef.current = {}
  }
  
  // Disconnect from voice channel
  const handleDisconnect = () => {
    console.log("Disconnecting from voice channel")
    socket.emit('leaveVoiceChannel', { user: activeUser })
    cleanupAllConnections()
    setActiveChannel(null)
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Channel header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">{activeChannel.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Users className="mr-2 h-4 w-4" />
              {connectedUsers.length}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Voice channel content */}
        <div className="flex flex-1 flex-col">
          {/* Connected users */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-4 text-lg font-semibold">Connected Users</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedUsers.map(user => (
                <div
                  key={user.id}
                  className="relative flex flex-col items-center rounded-lg border border-border bg-card p-4"
                >
                  <div className="relative mb-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={`/placeholder.svg?height=80&width=80`}
                        alt={user.username}
                      />
                      <AvatarFallback className="text-xl">
                        {user.username?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user.isSpeaking && (
                      <div className="absolute inset-0 animate-pulse rounded-full border-2 border-green-500"></div>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                      {user.isMuted && (
                        <div className="rounded-full bg-destructive p-1">
                          <MicOff className="h-3 w-3" />
                        </div>
                      )}
                      {user.isDeafened && (
                        <div className="rounded-full bg-destructive p-1">
                          <Headphones className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-medium">{user.username}</span>
                  <div className="mt-2 flex items-center gap-2">
                    {user.hasVideo && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-primary p-1">
                            <Video className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Video On</TooltipContent>
                      </Tooltip>
                    )}
                    {user.isScreenSharing && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-primary p-1">
                            <ScreenShare className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Sharing Screen</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume control */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center gap-4">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                className="flex-1"
                value={volume}
                min={0}
                max={100}
                step={1}
                onValueChange={setVolume}
              />
              <span className="w-8 text-sm text-muted-foreground">{volume}%</span>
            </div>
          </div>

          {/* Voice controls */}
          <div className="flex items-center justify-center gap-2 border-t border-border p-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="icon"
                  onClick={() => setIsDeafened(!isDeafened)}
                >
                  <Headphones className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDeafened ? "Undeafen" : "Deafen"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hasVideo ? "default" : "secondary"}
                  size="icon"
                  onClick={() => setHasVideo(!hasVideo)}
                >
                  {hasVideo ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasVideo ? "Turn Off Camera" : "Turn On Camera"}
              </TooltipContent>
            </Tooltip>

      
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={handleDisconnect}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Disconnect</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}