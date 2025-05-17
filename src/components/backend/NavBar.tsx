import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {

  const navigate = useNavigate();
  // Get user data from local storage
  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  // Function to handle sidebar menu toggle This function toggles the sidebar menu and the body overflow It adds or removes classes to the HTML and body elements
  const handleToggleMenu = () => {
    const html = document.documentElement;
    const body = document.body;
  
    if (html.classList.contains('menuitem-active') && html.classList.contains('sidebar-enable')) {
      html.classList.remove('menuitem-active', 'sidebar-enable');
      body.classList.remove('show');
      body.style.overflow = '';
    } else {
      html.classList.add('menuitem-active', 'sidebar-enable');
      body.classList.add('show');
      body.style.overflow = 'hidden';
    }
  };
  

  // Function to handle logout This function clears the local storage and redirects to the login page It prevents the default action of the event It uses the useNavigate hook from react-router-dom to navigate to the login page
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userData');
    navigate('/auth/login'); 
  };

  return (
    <div className="navbar-custom">
      <div className="topbar container-fluid">
        <div className="d-flex align-items-center gap-lg-2 gap-1">

          {/* Topbar Brand Logo */}
          <div className="logo-topbar">        
            <div className="logo-dark">
              <span className="logo-lg">
                <img src="/assets/images/logo.png" alt="dark logo"/>
              </span>
              <span className="logo-sm">
                <img src="/assets/images/logo.png" alt="small logo"/>
              </span>
            </div>
          </div>

          {/* Sidebar Menu Toggle Button */}
          <button className="button-toggle-menu d-lg-none"  onClick={handleToggleMenu}>
            <i className="mdi mdi-menu" />
          </button>

          {/* Horizontal Menu Toggle Button */}
          <button className="navbar-toggle" data-bs-toggle="collapse" data-bs-target="#topnav-menu-content">
            <div className="lines">
              <span /><span /><span />
            </div>
          </button>
          
        </div>

        <ul className="topbar-menu d-flex align-items-center gap-3">
          
          {/* Nav item for notification */}
          <li className="dropdown notification-list">
            <a className="nav-link dropdown-toggle arrow-none" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
              <i className="ri-notification-3-line font-22" />
              <span className="noti-icon-badge" />
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
              <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="m-0 font-16 fw-semibold"> Notification</h6>
                  </div>
                  <div className="col-auto">
                    <a href="#" className="text-dark text-decoration-underline">
                      <small>Clear All</small>
                    </a>
                  </div>
                </div>
              </div>
              <div className="px-2" style={{ maxHeight: 300 }} data-simplebar>
                <h5 className="text-muted font-13 fw-normal mt-2">Today</h5>
                {/* item*/}
                <a href="#" className="dropdown-item p-0 notify-item card read-noti shadow-none mb-2">
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close" /></span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon">
                          <img src="/assets/images/users/avatar-1.jpg" className="img-fluid rounded-circle" />
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">Name of the sender</h5>
                        <small className="noti-item-subtitle text-muted">Short part of the message sent will be here</small>
                      </div>
                    </div>
                  </div>
                </a>
                <div className="text-center">
                  <i className="mdi mdi-dots-circle mdi-spin text-muted h3 mt-0" />
                </div>
              </div>
              {/* All*/}
              <a href="#" className="dropdown-item text-center text-primary notify-item border-top py-2">
                View All
              </a>
            </div>
          </li>

          {/* Nav item for profile */}
          <li className="dropdown">
            <a className="nav-link dropdown-toggle arrow-none nav-user px-2" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
              <span className="account-user-avatar">
                <img src="/assets/images/users/avatar-1.jpg" alt="user-image" width={32} className="rounded-circle" />
              </span>
              <span className="d-lg-flex flex-column gap-1 d-none">
                <h5 className="my-0">{user.name || 'Guest'}</h5>
                <h6 className="my-0 fw-normal">{user.role || 'N/A'}</h6>
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated profile-dropdown">
              {/* item*/}
              <div className=" dropdown-header noti-title">
                <h6 className="text-overflow m-0">Welcome {user.role || 'N/A'}</h6>
              </div>
              {/* item*/}
              <a href="#" className="dropdown-item">
                <i className="mdi mdi-account-circle me-1" />
                <span>My Account</span>
              </a>
              {/* item*/}
              <a href="#" className="dropdown-item" onClick={handleLogout}>
                <i className="mdi mdi-logout me-1" />
                <span>Logout</span>
              </a>
            </div>
          </li>

        </ul>
      </div>
    </div>

  )
}

export default NavBar;