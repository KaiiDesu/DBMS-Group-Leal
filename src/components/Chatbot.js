// Chatbot.js
import React, { useState } from 'react';
import './Chatbot.css';
import botIcon from '../components/images/chatbot-icon.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your Bureau Chatbot assistant. How can I help you today?" }
  ]);
  
  

  const handleSuggestionClick = (msg) => {
    const userMsg = { from: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
  
    setTimeout(() => {
      const botReply = { from: 'bot', text: getBotResponse(msg) };
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const msg = message.toLowerCase();
  
    if (msg.includes('order')) {
      return 'To order, simply browse our shop and click the "Add to Cart" or "Buy Now" button. Proceed to checkout once done.';
    }
  
    if (msg.includes('location') || msg.includes('where')) {
      return 'We are located at 📍 VBP Vape Bureau PH, 826 Matimyas St. Sampaloc Manila. Open daily from 10AM to 9PM!';
    }
  
    if (msg.includes('representative') || msg.includes('contact')) {
      return 'You can reach out to our Shop Representative via Messenger or call us directly at 📞 0945-320-2818.';
    }
  
    return "I'm sorry, I didn't quite understand that. Could you try rephrasing?";
  };
  
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <img
          src={botIcon}
          className="chatbot-icon"
          alt="Open Chatbot"
          onClick={() => setIsOpen(true)}
        />
      )}

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <img src={botIcon} alt="Bot" className="chatbot-title-icon" />
              <span>Bureau<br />Chatbot</span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.from}`}>{msg.text}</div>
            ))}
          </div>

          {isTyping && (
            <div className="chat-msg bot typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}

          <div className="chatbot-suggestions">
            <button onClick={() => handleSuggestionClick('How to order?')}>How to order?</button>
            <button onClick={() => handleSuggestionClick('Where are you located?')}>Where are you located?</button>
            <button onClick={() => handleSuggestionClick('Connect with Bureau Representative')}>Connect with Bureau Representative</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
