import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarItem = ({ item }) => {
  const navigate = useNavigate();

  const scrollToSection = (event) => {
    event.preventDefault();

    if (item.link) {
      navigate(item.link); 
    } else if (item.className) {
      const [page, section] = item.className.split('#');
      navigate(`/${page}#${section}`);

      setTimeout(() => {
        const sectionElement = document.querySelector(`.${section}`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); 
    }
  };

  return (
    <li><a href="#" onClick={scrollToSection}>{item.title}</a></li>
  );
};

export default NavbarItem;


