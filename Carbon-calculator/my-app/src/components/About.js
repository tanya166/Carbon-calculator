import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './About.css';
import Chat from './Chat';

const About = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

useEffect(() => {
  console.log('useEffect is running...');
  
  const fetchPosts = async () => {
    console.log('fetchPosts function started'); 
    setLoading(true);
    
    try {
     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/about`);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      setPosts(response.data);
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      setError(`Could not load data: ${error.message}`);
    } finally {
      console.log('fetchPosts completed');
      setLoading(false);
    }
  };

  fetchPosts();
}, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      const section = document.querySelector(`.${hash}`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const handleChatBotClick = () => {
    setIsChatOpen(true);
    setShowAlert(true);
  };

  useEffect(() => {
    if (showAlert) {
      alert("Click on the chatbot icon on the bottom right of the screen!");
      setShowAlert(false);
    }
  }, [showAlert]); 
const handleSubmit = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem('authToken');
  console.log('Token exists:', !!token);
  console.log('Token value:', token);
  console.log('Token length:', token ? token.length : 0);

  if (!token) {
    const shouldLogin = window.confirm('You are not logged in. Would you like to login now?');
    if (shouldLogin) {
      navigate('/login');
    }
    return;
  }
  
  try {
    console.log('Making request with token:', token.substring(0, 20) + '...');
    
    const response = await axios.post('https://carbon-calculator-production.up.railway.app/api/user/contact', 
      { email, message },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    alert(response.data.msg || 'Support request submitted successfully!');
    setEmail('');
    setMessage('');
  } catch (error) {
    console.error('Error submitting support request:', error);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
 
    if (error.response && error.response.status === 401) {
      const shouldLogin = window.confirm(
        'Please login to submit the form. Would you like to login now?'
      );
      if (shouldLogin) {
        navigate('/login');
      }
    } else {
      alert('Failed to submit support request: ' + (error.response?.data?.message || error.message));
    }
  }
};
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className='aboutt'>
        <div className='aboutus'>About us</div>
        <div className='circles'>
          <div className='deets'>
            <button onClick={() => document.querySelector('.text-part').scrollIntoView({ behavior: 'smooth' })}
                    className='c1' style={{ backgroundImage: `url(/assets/we.png)` }}></button>
            <div className='b-name'>How do we help?</div>
          </div>
          <div className='deets'>
            <button className='c2' onClick={() => document.querySelector('.about-container').scrollIntoView({behavior: 'smooth', block: 'start' })}
                    style={{ backgroundImage: `url(/assets/helpp.png)` }}></button>
            <div className='b-name'>Who are we?</div>
          </div>
          <div className='deets'>
            <button className='c3' onClick={() => document.querySelector('.c_us').scrollIntoView({ behavior: 'smooth' })}
                    style={{ backgroundImage: `url(/assets/contact.png)` }}></button>
            <div className='b-name'>Contact us</div>
          </div>
          <div className='deets'>
            <button className='c4' onClick={handleChatBotClick} style={{ backgroundImage: `url(/assets/bot.png)` }}></button>
            <div className='b-name'>Chat bot</div>
          </div>
        </div>
      </div>

<div className="how_We">
  <div className="text-part">
    <h2 className="ipsum">How do we help?</h2>
    <div className="lorem">
      {posts.filter(post => post.id === 1).map(post => (
        <div key={post.id} className="z1">
          <p>{post.text_1}</p>
          <p>{post.text_2}</p>
        </div>
      ))}
    </div>
  </div>

  <div className="container11">
    <div className="rectangle11"></div>
    <img src="/assets/one1.png" className="one1" alt="one1" />
    <img src="/assets/two2.png" className="two2" alt="two2" />
  </div>
</div>

<div className="about-container">
  <div className="about-image">
    <img src="/assets/mee.png" alt="mee" />
  </div>

  <div className="about-text">
    <h2>About Me</h2>
    {posts.filter(post => post.id === 2).map(post => (
      <div key={post.id}>
        <p>{post.text_1}</p>
        <p style={{ marginTop: '1rem' }}>{post.text_2}</p>
      </div>
    ))}
  </div>
</div>

      <div className='c_us' style={{ backgroundImage: `url(/assets/contact_us.png)` }}>
        <div className='are-a'>
          <div className='Contact-text'>
            <h1 className='us'>Contact us</h1>
            <div className='text7'>
              <div className='email'> E-mail :</div>
              <div className='giv-email'>
                <input type='text' className='contact-input1'
                       value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className='contact-1'>Want to reach out to us?</div>
              <div className='write-ur-problme'>(Write your problem to us)</div>
              <input type='text' className='contact-input'
                     value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <button type='submit' className='submit-1' onClick={handleSubmit}>Submit</button>
          </div>
          <img src="/assets/support.png" className='support' alt="support" />
        </div>
      </div>

      {isChatOpen && <Chat />}
    </>
  );
};

export default About;