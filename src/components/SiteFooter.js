import React from 'react';

const SiteFooter = () => (
  <footer className="site-footer">
    <p className="site-footer-brand">PYQuer</p>
    <p className="site-footer-text">
      Turn previous year question papers into a focused study plan with AI.
    </p>
    <p className="site-footer-copy">© {new Date().getFullYear()} PYQuer. All rights reserved.</p>
  </footer>
);

export default SiteFooter;
