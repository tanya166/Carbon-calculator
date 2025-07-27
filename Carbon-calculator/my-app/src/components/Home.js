
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';
import homee from '../assets/home.png';
import train from '../assets/train.png';
import flight from '../assets/flight.png';
import car from '../assets/car.png';
import bus from '../assets/bike.png';
import Form from './Form';
import Form2 from './Form2';
import Form3 from './Form3';
import Form4 from './Form4';
import Chat from './Chat';

const Home = () => {
  const [activeForm, setActiveForm] = useState('form1');
  const [animate, setAnimate] = useState(false);
  const location = useLocation();
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleImageClick = (form) => {
    if (form !== activeForm) {
      setAnimate(true);
      setTimeout(() => {
        setActiveForm(form);
        setAnimate(false);
      }, 500);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const middleSection = document.querySelector('.middle_part');
    if (middleSection) {
      observer.observe(middleSection);
    }

    return () => {
      if (middleSection) {
        observer.unobserve(middleSection);
      }
    };
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

  const handleTransportClick = (transport) => {
    setSelectedTransport(transport);
  };

  return (
    <>

      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Save Our Planet
            <span className="title-highlight">Together</span>
          </h1>
          <p className="hero-subtitle">
            Every action counts in t fight against climate change
          </p>
          <div className="hero-cta">
            <button className="cta-button primary" onClick={() => {
              document.querySelector('.middle_part').scrollIntoView({ behavior: 'smooth' });
            }}>
              Calculate Your Impact
            </button>
            
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </div>
      <div className={`middle_part ${isVisible ? 'visible' : ''}`}>
        <div className="calculator-section">
          <div className="calculator-header">
            <h2 className="h animate-title">Calculate your Carbon Footprint</h2>
            <p className="h2 animate-subtitle">
              Use our interactive calculator to learn your carbon footprint and actions to take to reduce it
            </p>
            <p className="h3 animate-description">
              Carbon footprint calculations are typically based on annual emissions from the previous 12 months.
            </p>
          </div>

          <div className="transport-selection">
            <h3 className="h3_modes animate-modes-title">Choose your mode:</h3>
            <div className="modes">
              <div className="app">
                <div className="image-container">
                  <div className="transport-grid">
                    <div className={`transport-item ${selectedTransport === 'Form' ? 'selected' : ''}`}
                         onClick={() => { handleImageClick('Form'); handleTransportClick('Form'); }}>
                      <div className="transport-icon">
                        <img src={homee} className='pic' alt="home" />
                      </div>
                      <span className="transport-label">Home</span>
                    </div>
                    
                    <div className={`transport-item ${selectedTransport === 'Form2' ? 'selected' : ''}`}
                         onClick={() => { handleImageClick('Form2'); handleTransportClick('Form2'); }}>
                      <div className="transport-icon">
                        <img src={flight} className='pic' alt="flight" />
                      </div>
                      <span className="transport-label">Flight</span>
                    </div>
                    
                    <div className={`transport-item ${selectedTransport === 'Form3' ? 'selected' : ''}`}
                         onClick={() => { handleImageClick('Form3'); handleTransportClick('Form3'); }}>
                      <div className="transport-icon">
                        <img src={car} className='pic' alt="car" />
                      </div>
                      <span className="transport-label">Car</span>
                    </div>
                    
                    <div className={`transport-item ${selectedTransport === 'Form4' ? 'selected' : ''}`}
                         onClick={() => { handleImageClick('Form4'); handleTransportClick('Form4'); }}>
                      <div className="transport-icon">
                        <img src={bus} className='pic' alt="bike" />
                      </div>
                      <span className="transport-label">Bike</span>
                    </div>
                    
                  </div>
                </div>
                
                <div className={`form-container ${animate ? 'slide' : ''}`}>
                  <div className="form-wrapper">
                    {activeForm === 'Form' && (
                      <div className="form animate-form">
                        <Form />
                      </div>
                    )}
                    {activeForm === 'Form2' && (
                      <div className="form animate-form">
                        <Form2 />
                      </div>
                    )}
                    {activeForm === 'Form3' && (
                      <div className="form animate-form">
                        <Form3 />
                      </div>
                    )}
                    {activeForm === 'Form4' && (
                      <div className="form animate-form">
                        <Form4 />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chat-section">
        <Chat />
      </div>
    </>
  );
};

export default Home;