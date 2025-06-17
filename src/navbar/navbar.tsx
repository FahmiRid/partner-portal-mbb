import React, { useState } from 'react';
import {
  Navbar,
  Container,
  Button,
  Offcanvas,
} from 'react-bootstrap';
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
  faCartShopping,
  faDollarSign,
  faLayerGroup,
  faChartBar,
  faQuestionCircle,
  faChevronRight,
  faChevronDown,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../navbar/navbar.scss'

interface NavItem {
  id: number;
  title: string;
  link: string;
  active?: boolean;
  icon: any;
  children?: NavItem[];
}

interface SidebarNavbarProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const SidebarNavbar: React.FC<SidebarNavbarProps> = ({
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const [show, setShow] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const toggleSidebar = () => setSidebarExpanded(!sidebarExpanded);

  const navItems: NavItem[] = [
    { id: 1, title: 'Home', link: '/home', active: true, icon: faHome },
    {
      id: 2,
      title: 'Services',
      link: '#',
      icon: faCartShopping,
      children: [
        { id: 21, title: 'Manage Product', link: '/product-list', icon: faCartShopping },
        { id: 22, title: 'Manage Stock', link: '/stock-list', icon: faLayerGroup },
        { id: 23, title: 'Manage Order', link: '#', icon: faChartBar },
      ],
    },
    { id: 3, title: 'Catalog', link: '/catalog', icon: faTools },
    { id: 4, title: 'Finance', link: '#', icon: faDollarSign },
    { id: 5, title: 'Layers', link: '#', icon: faLayerGroup },
    { id: 6, title: 'Charts', link: '#', icon: faChartBar },
    { id: 7, title: 'Users', link: '#', icon: faUsers },
    { id: 8, title: 'About', link: '#', icon: faInfoCircle },
    { id: 9, title: 'Contact', link: '#', icon: faPhone },
  ];

  // Styles
  const sidebarBg = isDarkMode ? '#121f26' : '#121f26';
  const sidebarHoverBg = isDarkMode ? '#34495e' : '#2c3e50';
  const activeBg = isDarkMode ? '#F6F6FC33' : '#F6F6FC33';
  const iconColor = '#ffffff';

  const sidebarWidth = sidebarExpanded ? '250px' : '70px';

  const handleDropdownToggle = (itemId: number) => {
    if (sidebarExpanded) {
      setExpandedDropdown(expandedDropdown === itemId ? null : itemId);
    }
  };

  return (
    <div className="d-flex">
      <div
        className="d-flex flex-column position-fixed"
        style={{
          width: sidebarWidth,
          height: '100vh',
          background: sidebarBg,
          zIndex: 1000,
          top: 0,
          left: 0,
          paddingTop: '20px',
          paddingBottom: '20px',
          transition: 'width 0.3s ease',
          overflowX: 'hidden'
        }}
      >
        <div className={`d-flex justify-content-center mb-4 ${sidebarExpanded ? 'custom-position-expanded' : 'custom-position'}`}>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: iconColor,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FontAwesomeIcon
              icon={sidebarExpanded ? faTimes : faBars}
              size="lg"
              style={{
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        </div>
        {/* Logo/Brand */}
        <div className="d-flex justify-content-center mb-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              background: '#f39c12',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            🦁
          </div>
        </div>



        {/* Toggle Button - Always visible */}


        {/* Navigation Items */}
        <div className="d-flex flex-column flex-grow-1 gap-1 px-2">
          {navItems.slice(0, 7).map((item, index) => (
            <div key={item.id} style={{ marginBottom: '4px' }}>
              <button
                className="btn p-0 border-0 d-flex align-items-center w-100"
                onClick={() => {
                  if (item.children) {
                    if (sidebarExpanded) {
                      handleDropdownToggle(item.id);
                    } else {
                      setSidebarExpanded(true);
                      setTimeout(() => handleDropdownToggle(item.id), 300);
                    }
                  } else {
                    navigate(item.link);
                  }
                }}
                style={{
                  height: '50px',
                  borderRadius: '12px',
                  background: item.active ? activeBg : 'transparent',
                  color: iconColor,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  padding: sidebarExpanded ? '0 16px' : '0',
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center'
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = sidebarHoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} size="lg" />
                </div>
                {sidebarExpanded && (
                  <>
                    <span
                      className="ms-3 text-white"
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.95rem'
                      }}
                    >
                      {item.title}
                    </span>
                    {item.children && (
                      <FontAwesomeIcon
                        icon={expandedDropdown === item.id ? faChevronDown : faChevronRight}
                        size="sm"
                        className="ms-auto px-3"
                        style={{ transition: 'transform 0.3s ease' }}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Dropdown Items */}
              {item.children && sidebarExpanded && expandedDropdown === item.id && (
                <div
                  className="mt-2"
                  style={{
                    paddingLeft: '20px',
                    maxHeight: expandedDropdown === item.id ? '200px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease'
                  }}
                >
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      className="btn p-0 border-0 d-flex align-items-center w-100 mb-1"
                      onClick={() => navigate(child.link)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: iconColor,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        padding: '0 12px',
                        justifyContent: 'flex-start'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '30px',
                          height: '30px',
                          flexShrink: 0
                        }}
                      >
                        <FontAwesomeIcon icon={child.icon} size="sm" />
                      </div>
                      <span
                        className="ms-2 text-white"
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: '0.85rem'
                        }}
                      >
                        {child.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Icons */}
        <div className="d-flex flex-column gap-1 px-2">
          <button
            className="btn p-0 border-0 d-flex align-items-center position-relative w-100"
            style={{
              height: '50px',
              borderRadius: '12px',
              background: 'transparent',
              color: iconColor,
              transition: 'all 0.3s ease',
              padding: sidebarExpanded ? '0 16px' : '0',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = sidebarHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center position-relative"
              style={{
                width: '40px',
                height: '40px',
                flexShrink: 0
              }}
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{
                  background: '#e74c3c',
                  fontSize: '0.6rem',
                  minWidth: '18px',
                  height: '18px'
                }}
              >
                3
              </span>
            </div>
            {sidebarExpanded && (
              <span
                className="ms-3 text-white"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.95rem'
                }}
              >
                Notifications
              </span>
            )}
          </button>

          <button
            className="btn p-0 border-0 d-flex align-items-center w-100"
            style={{
              height: '50px',
              borderRadius: '12px',
              background: 'transparent',
              color: iconColor,
              transition: 'all 0.3s ease',
              padding: sidebarExpanded ? '0 16px' : '0',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = sidebarHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                flexShrink: 0
              }}
            >
              <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
            </div>
            {sidebarExpanded && (
              <span
                className="ms-3 text-white"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.95rem'
                }}
              >
                Help
              </span>
            )}
          </button>

          <button
            className="btn p-0 border-0 d-flex align-items-center w-100"
            onClick={() => navigate('/')}
            style={{
              height: '50px',
              borderRadius: '12px',
              background: 'transparent',
              color: iconColor,
              transition: 'all 0.3s ease',
              padding: sidebarExpanded ? '0 16px' : '0',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e74c3c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                flexShrink: 0
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
            </div>
            {sidebarExpanded && (
              <span
                className="ms-3 text-white"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.95rem'
                }}
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Navbar */}
      <div style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, transition: 'margin-left 0.3s ease, width 0.3s ease' }}>
        <Navbar
          expand={false}
          className="mb-3 py-3 shadow-sm"
          data-bs-theme={isDarkMode ? 'dark' : 'light'}
          // style={{
          //   background: 'rgb(252, 231, 0)',
          //   borderBottom: '1px solid rgba(252, 231, 0)'
          // }}
        >
          <Container fluid>
            <div className="ms-auto">
              <Button
                variant="link"
                className="p-0 border-0"
                style={{ color: isDarkMode ? 'white' : 'black'}}
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <FontAwesomeIcon
                  icon={isDarkMode ? faSun : faMoon}
                  size="lg"
                />
              </Button>
            </div>
          </Container>
        </Navbar>

      </div>

      {/* Offcanvas for Mobile/Expanded Menu */}
      <Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="start"
        show={show}
        onHide={handleClose}
        className="border-0"
        data-bs-theme={isDarkMode ? 'dark' : 'light'}
      >
      </Offcanvas>
    </div>
  );
};

export default SidebarNavbar;