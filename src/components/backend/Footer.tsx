import Config from "../../helpers/Config";

const Footer = () => {
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
          Copyright © {currentYear}. <strong>{Config[0].APP_NAME}</strong> - All rights reserved.
          </div>
          <div className="col-md-6">
            <div className="text-md-end footer-links d-none d-md-block">
              <a href="#">Help</a>
              <a href="#">Documentations</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

  )
}

export default Footer;