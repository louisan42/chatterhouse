import React, { useState } from 'react';
import Video from './video';

interface Message {
  sender: string;
  text: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { sender: 'user', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', width: '800px', border: '1px solid #ccc', borderRadius: '5px', padding: '10px', margin: '20px auto' }}>
        <div style={{flex:1, display:'flex', gap:'10px'}}>
          <div style={{width:'400px', height:'300px'}}>
            <Video/>
          </div>
        
        
        <div style={{ flex: 1, height: '300px', overflowY: 'scroll', border: '1px solid gray', padding: '10px' }}>
       
        
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{message.sender}:</strong> {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{ width: '80%', padding: '5px', marginTop: '10px' }}
      />
      <button onClick={handleSendMessage} style={{ padding: '5px 10px', marginLeft: '5px' }}>
        Send
      </button>
      </div>
      </div>
    </div>
  );
};

export default ChatRoom;