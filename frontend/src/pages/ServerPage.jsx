import Layout from "../components/Layout"

 const ServerPage = ()=> {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Welcome to SoulSync</h1>
        <p className="text-[#b9bbbe]">Connect with your community and start syncing souls!</p>
        <div className="mt-8 bg-[#2f3136] rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Getting Started</h2>
          <ul className="list-disc list-inside text-[#b9bbbe]">
            <li>Join a text channel to start chatting</li>
            <li>Connect to a voice channel to talk with others</li>
            <li>Send direct messages to your friends</li>
            <li>Customize your profile and settings</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}

export default ServerPage