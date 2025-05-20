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
  faBars
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

const OffcanvasNavbar: React.FC = () => {
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
    { id: 4, title: 'About', link: '#', icon: faInfoCircle },
    { id: 5, title: 'Contact', link: '#', icon: faPhone },
  ];

  return (
    <>
      <Navbar 
        expand={false} 
        className="mb-3 py-3 shadow-sm" 
        style={{ 
          background: 'linear-gradient(135deg, rgb(242, 211, 25)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Container fluid>
          <Button 
            onClick={handleShow}
            variant="link"
            className="me-2 p-0 border-0"
            style={{ color: 'white' }}
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </Button>
          
          {/* <Form className="d-flex mx-auto" style={{ maxWidth: '500px', width: '100%' }} onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="rounded-pill"
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none',
                  color: 'white',
                  paddingLeft: '15px'
                }}
              />
              <Button 
                variant="link" 
                className="position-absolute end-0 z-10 bg-transparent border-0"
                style={{ color: 'white', zIndex: 10 }}
                type="submit"
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputGroup>
          </Form> */}
          
          <Button
            variant="link"
            className="p-0 border-0 position-relative"
            style={{ color: 'white' }}
          >
            <FontAwesomeIcon icon={faBell} size="lg" />
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
              style={{ background: '#ff4e50', fontSize: '0.6rem' }}
            >
              3
            </span>
          </Button>
          
          <Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
            show={show}
            onHide={handleClose}
            className="border-0"
          >
            <Offcanvas.Header 
              closeButton
              className="border-0" 
              style={{ 
                background: 'linear-gradient(135deg, rgb(242 211 25), rgb(31 39 19)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Offcanvas.Title className='text-white fw-bold' id="offcanvasNavbarLabel">
                Dashboard
              </Offcanvas.Title>
            </Offcanvas.Header>
            
            <Offcanvas.Body className='bg-dark'>
              <div className="d-flex flex-column h-100">
                <Nav className="flex-column gap-2 mb-auto">
                  {navItems.map((item) => (
                    item.children ? (
                      <NavDropdown
                        key={item.id}
                        title={
                          <span>
                            <FontAwesomeIcon icon={item.icon} className="me-3" /> {item.title}
                          </span>
                        }
                        id="nav-dropdown"
                        className="text-light py-3 px-4 rounded-3 custom-gap"
                        style={{ 
                          background: item.active ? 'rgba(255,255,255,0.1)' : '',
                          transition: 'all 0.3s ease',
                        }}
                        menuVariant="dark"
                      >
                        {item.children.map((child) => (
                          <NavDropdown.Item key={child.id} className="mt-3 mb-3" href={child.link} style={{ backgroundColor: 'transparent' }}>
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
                        className={`text-light py-3 px-4 rounded-3 ${item.active ? 'active-link' : 'nav-link-hover'}`}
                        style={{ 
                          background: item.active ? 'rgba(255,255,255,0.1)' : '',
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