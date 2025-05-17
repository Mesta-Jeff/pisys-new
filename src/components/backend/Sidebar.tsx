
import React from "react";
import { Link } from 'react-router-dom';

const SideBar = () => {


    const handleCloseSidebar = () => {
        const html = document.documentElement;
        const body = document.body;

        html.classList.remove('menuitem-active', 'sidebar-enable');
        body.classList.remove('show');
        body.style.overflow = '';
    };


    return (

        <div className="leftside-menu">

            {/* Sidebar Hover Menu Toggle Button */}
            <div className="button-sm-hover" data-bs-toggle="tooltip" data-bs-placement="right" title="Show Full Sidebar">
                <i className="ri-checkbox-blank-circle-line align-middle" />
            </div>

            {/* Full Sidebar Menu Close Button */}
            <div className="button-close-fullsidebar" onClick={handleCloseSidebar}>
                <i className="ri-close-fill align-middle" />
            </div>

            {/* Sidebar -left */}
            <div className="h-100" id="leftside-menu-container" data-simplebar>


                <ul className="side-nav" id="sidebarNav">

                    <li className="side-nav-title">Navigation</li>

                    {/* Tab Items */}
                    <ul className="nav nav-tabs nav-bordered mb-3">
                        <li className="nav-item">
                            <a href="#sdm" data-bs-toggle="tab" aria-expanded="true" className="nav-link active">
                                <i className="mdi mdi-account-circle d-md-none d-block" />
                                <span className="d-none d-md-block">PiSys Menu</span>
                            </a>
                        </li>
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content">
                        <div className="tab-pane show active" id="sdm">
                            
                            <li className="side-nav-item">
                                <Link to="/admin/dashboard" className="side-nav-link">
                                    <i className="uil-home-alt" />
                                    <span> Dashboard </span>
                                </Link>
                            </li>

                            <li className="side-nav-title">Product ELements</li>

                            <li className="side-nav-item">
                                <a data-bs-toggle="collapse" href="#sidebarProduct" aria-expanded="false" aria-controls="sidebarProduct" className="side-nav-link">
                                    <i className="uil-swatchbook" />
                                    <span> Manage Products </span>
                                    <span className="menu-arrow" />
                                </a>
                                <div className="collapse" id="sidebarProduct" data-bs-parent="#sidebarNav">
                                    <ul className="side-nav-second-level">
                                        <li><Link to="/admin/products">Product List</Link></li>
                                    </ul>
                                </div>
                            </li>

                        </div>
                       


                    </div>

                </ul>

                {/*- End Sidemenu */}
                <div className="clearfix" />
            </div>
        </div>

    )
}

export default SideBar;