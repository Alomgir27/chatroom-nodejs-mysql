import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatroomLandingPage = () => {

    const navigate = useNavigate();
  return (
    <div style={{ 
      backgroundColor: '#2c3e50',
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection: 'column'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: '#fff', 
        fontWeight: 'bold', 
        marginBottom: '1rem'
      }}>Welcome to the Chatroom Application</h1>
      <p style={{ 
        fontSize: '1.5rem', 
        color: '#fff', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>Connect with people around the world in real-time and join the conversation</p>
      <button style={{ 
        padding: '1rem 2rem', 
        backgroundColor: '#fff', 
        color: '#007bff', 
        borderRadius: '5px', 
        fontSize: '1.2rem',
        border: 'none',
        cursor: 'pointer'
        
      }} onClick={() => navigate('/login')}>Join Chatroom</button>
    </div>
  );
};

export default ChatroomLandingPage;