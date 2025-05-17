import React, { useState } from 'react';
import { Outlet } from "react-router-dom";

import NavBar from '../components/backend/NavBar';
import SideBar from '../components/backend/Sidebar';
import Footer from '../components/backend/Footer';
import ConnectionStatus from '../components/ConnectionStatus';


function Dashboard() {

    const [pageTitle, setPageTitle] = useState('Dashboard');

    return (
        <>
            <div className="wrapper">

                <NavBar />

                <ConnectionStatus />

                <SideBar />

                <div className="content-page">

                    <Outlet title={pageTitle} context={{ setPageTitle }}/>

                    <br /><br /><br />

                    <Footer />
                </div>

            </div>

        </>
    )
}


export default Dashboard;