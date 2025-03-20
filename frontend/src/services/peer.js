class PeerManager {
    constructor(localStream, socket, onTrackCallback) {
      this.localStream = localStream;
      this.socket = socket;
      this.peers = {};
      this.onTrackCallback = onTrackCallback;
    }
  
    createPeerConnection(peerId) {
      if (this.peers[peerId]) {
        console.log(`🔄 Reusing existing PeerConnection for: ${peerId}`);
        return this.peers[peerId];
      }
  
      console.log(`📡 Creating new PeerConnection for: ${peerId}`);
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
  
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit("iceCandidate", {
            candidate: event.candidate,
            fromId: this.socket.id,
            toId: peerId,
          });
        }
      };
  
      peerConnection.ontrack = (event) => {
        console.log(`🎧 Received remote stream from: ${peerId}`);
        this.onTrackCallback(peerId, event.streams[0]);
      };
  
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream);
      });
  
      this.peers[peerId] = peerConnection;
      return peerConnection;
    }
  
    async sendOffer(peerId) {
      const peerConnection = this.createPeerConnection(peerId);
  
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
  
        console.log(`📡 Sending WebRTC offer to: ${peerId}`);
        this.socket.emit("offer", { offer, fromId: this.socket.id, toId: peerId });
      } catch (error) {
        console.error("❌ Error in sendOffer:", error);
      }
    }
  
    async handleOffer(offer, fromId) {
      console.log(`📡 Received WebRTC offer from: ${fromId}`);
      const peerConnection = this.createPeerConnection(fromId);
  
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
  
        console.log(`✅ Sending WebRTC answer to: ${fromId}`);
        this.socket.emit("answer", { answer, fromId: this.socket.id, toId: fromId });
      } catch (error) {
        console.error("❌ Error in handleOffer:", error);
      }
    }
  
    async handleAnswer(answer, fromId) {
      console.log(`✅ Received WebRTC answer from: ${fromId}`);
      if (this.peers[fromId]) {
        try {
          await this.peers[fromId].setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error("❌ Error in handleAnswer:", error);
        }
      }
    }
  
    async handleIceCandidate(candidate, fromId) {
      console.log(`❄️ Received ICE candidate from: ${fromId}`);
      if (this.peers[fromId]) {
        try {
          await this.peers[fromId].addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("❌ Error in handleIceCandidate:", error);
        }
      }
    }
  }
  
  export default PeerManager;
  