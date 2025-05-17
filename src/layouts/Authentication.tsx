
import { Outlet } from "react-router-dom";
import Config from '../helpers/Config'
import ConnectionStatus from "../components/ConnectionStatus";



const Authentication = () => {

  const currentYear = new Date().getFullYear();

  return (
    <>

      <div className="position-absolute start-0 end-0 start-0 bottom-0 w-100 h-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 800">
          <g fillOpacity="0.12">
            <circle style={{ fill: 'rgba(var(--ct-primary-rgb), 0.1)' }} cx={400} cy={400} r={600} />
          </g>
        </svg>
      </div>

      <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5 position-relative">
        <div className="container">

          <ConnectionStatus />
          <Outlet />

        </div>
      </div>

      <footer className="footer footer-alt">
        Copyright © {currentYear}. <strong>{Config[0].APP_NAME}</strong> - All rights reserved.
      </footer>

    </>

  )
}

export default Authentication
