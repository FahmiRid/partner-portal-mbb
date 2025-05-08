import React from 'react';
import LogoMaybank from '../img/logo_company_2.svg'; // assuming LogoMaybank is an image file

const Header = () => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <h1 className="h3 mb-0 fw-bold text-dark">
        <img
          className="img-fluid"
          src={LogoMaybank}
          alt="Logo"
          style={{ maxWidth: '5em' }}
        />
      </h1>
    </div>
  );
};

export default Header;