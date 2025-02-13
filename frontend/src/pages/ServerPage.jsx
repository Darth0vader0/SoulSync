import { useState } from 'react';

import Layout from '../components/Layout';

import ChannelUI from '../components/ChannelUi';
import VoiceChannelUI from '../components/VoiceChannelUi.jsx';

function ServerPage() {
  const [activeChannel, setActiveChannel] = useState({
    type: 'voice', // or 'voice'
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

export default ServerPage;