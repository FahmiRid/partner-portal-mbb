import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Navbar, 
  Container, 
  Nav, 
  Button, 
  Offcanvas, 
  NavDropdown 
} from 'react-bootstrap';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faHome,
  faTools,
  faInfoCircle,
  faPhone,
  faSignOutAlt,
  faBell,
  faUsers,
  faBars,
  faSun,
  faMoon,
  faCartShopping
} from '@fortawesome/free-solid-svg-icons';
import './navbar.scss'

interface NavItem {
  id: number;
  title: string;
  link: string;
  active?: boolean;
  icon: any; // Font Awesome icon
  children?: NavItem[];
}

interface OffcanvasNavbarProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const OffcanvasNavbar: React.FC<OffcanvasNavbarProps> = ({ 
  isDarkMode = false, 
  onToggleDarkMode 
}) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Sample navigation items with Font Awesome icons
  const navItems: NavItem[] = [
    { id: 1, title: 'Home', link: '/home', active: true, icon: faHome },
    { id: 2, title: 'Users', link: '#', icon: faUsers },
    {
      id: 3,
      title: 'Services',
      link: '#',
      icon: faTools,
      children: [
        { id: 31, title: 'Manage Product', link: '/product-list', icon: '' },
        { id: 32, title: 'Manage Stock', link: '/stock-list', icon: '' },
        { id: 33, title: 'Manage Order', link: '#', icon: '' },
      ],
    },
    { id: 4, title: 'Catalog', link: '/catalog', icon: faCartShopping },
    { id: 5, title: 'About', link: '#', icon: faInfoCircle },
    { id: 6, title: 'Contact', link: '#', icon: faPhone },
  ];

  // Dynamic styles based on theme
  const navbarBg = isDarkMode 
    ? 'linear-gradient(135deg, rgb(33, 37, 41), rgb(52, 58, 64))' 
    : 'linear-gradient(135deg, rgb(242, 211, 25), rgb(31, 39, 19))';
  
  const offcanvasHeaderBg = isDarkMode
    ? 'linear-gradient(135deg, rgb(33, 37, 41), rgb(52, 58, 64))'
    : 'linear-gradient(135deg, rgb(242 211 25), rgb(31 39 19))';

  const offcanvasBodyBg = isDarkMode ? 'bg-dark' : 'bg-light';
  const textColor = isDarkMode ? 'text-light' : 'text-dark';
  const buttonColor = isDarkMode ? 'white' : 'white';

  return (
    <>
      <Navbar 
        expand={false} 
        className="mb-3 py-3 shadow-sm" 
        data-bs-theme={isDarkMode ? 'dark' : 'light'}
        style={{ 
          background: navbarBg,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Container fluid>
          <Button 
            onClick={handleShow}
            variant="link"
            className="me-2 p-0 border-0"
            style={{ color: buttonColor }}
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </Button>
          
          <div className="d-flex align-items-center gap-4">
            {/* Dark Mode Toggle Button */}
            <Button
              variant="link"
              className="p-0 border-0"
              style={{ color: buttonColor }}
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <FontAwesomeIcon 
                icon={isDarkMode ? faSun : faMoon} 
                size="lg" 
              />
            </Button>

            <Button
              variant="link"
              className="p-0 border-0 position-relative"
              style={{ color: buttonColor }}
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              <span 
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ background: '#ff4e50', fontSize: '0.6rem' }}
              >
                3
              </span>
            </Button>
          </div>
          
          <Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
            show={show}
            onHide={handleClose}
            className="border-0"
            data-bs-theme={isDarkMode ? 'dark' : 'light'}
          >
            <Offcanvas.Header 
              closeButton
              className="border-0" 
              style={{ 
                background: offcanvasHeaderBg,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Offcanvas.Title className='text-white fw-bold' id="offcanvasNavbarLabel">
                Dashboard
              </Offcanvas.Title>
            </Offcanvas.Header>
            
            <Offcanvas.Body className={offcanvasBodyBg}>
              <div className="d-flex flex-column h-100">
                <Nav className="flex-column gap-2 mb-auto">
                  {navItems.map((item) => (
                    item.children ? (
                      <NavDropdown
                        key={item.id}
                        title={
                          <span className={textColor}>
                            <FontAwesomeIcon icon={item.icon} className="me-3" /> {item.title}
                          </span>
                        }
                        id="nav-dropdown"
                        className={`${textColor} py-3 px-4 rounded-3 custom-gap`}
                        style={{ 
                          background: item.active ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : '',
                          transition: 'all 0.3s ease',
                        }}
                        menuVariant={isDarkMode ? 'dark' : 'light'}
                      >
                        {item.children.map((child) => (
                          <NavDropdown.Item 
                            key={child.id} 
                            className="mt-3 mb-3" 
                            href={child.link} 
                            style={{ backgroundColor: 'transparent' }}
                          >
                            <FontAwesomeIcon icon={child.icon} className="me-3" /> {child.title}
                          </NavDropdown.Item>
                        ))}
                      </NavDropdown>
                    ) : (
                      <Nav.Link
                        key={item.id}
                        href={item.link}
                        active={item.active}
                        onClick={handleClose}
                        className={`${textColor} py-3 px-4 rounded-3 ${item.active ? 'active-link' : 'nav-link-hover'}`}
                        style={{ 
                          background: item.active ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : '',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FontAwesomeIcon icon={item.icon} className="me-3" /> {item.title}
                      </Nav.Link>
                    )
                  ))}
                </Nav>
                
                <div className="mt-auto pt-4">
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-100 py-3 rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      background: 'rgba(214, 39, 39, 0.2)',
                      border: 'none',
                      color: '#ff4e50',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Log out
                  </Button>
                </div>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default OffcanvasNavbar;