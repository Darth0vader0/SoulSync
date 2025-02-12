import { useState } from 'react';

import Layout from '../components/Layout';

import ChannelUI from '../components/ChannelUi';
import VoiceChannelUI from '../components/VoiceChannelUi.jsx';

function App() {
  const [activeChannel, setActiveChannel] = useState({
    type: 'text', // or 'voice'
    name: 'general'
  });

  return (
    <Layout>
      {activeChannel.type === 'text' ? (
          <ChannelUI channelName={activeChannel.name} />
        
      ) : (
        <VoiceChannelUI channelName={activeChannel.name} />
      )}
    </Layout>
  );
}

export default App;