import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './FrontPage.css';

export const FrontPage: React.FC = () => {
  return (
    <>
    <div className='scrollme'>
        Public Transport Reward
        {/* <Link to="/frontpage" className='scrollme-text'>refresh</Link> */}
    </div>
    <div className='frontmain'>
    <Link
        to="/adminLogin"
        className="text-sm text-blue-600 hover:text-blue-800 text-center"
        >
            <div className="card">
                {/* <div className="card-header">Admin Login</div> */}
                    <div className="card-body">
                        <h2>Admin Login</h2>
                    </div>
                {/* </div> */}
            </div>
    </Link>
    <Link
        to="/conductorLogin"
        className="text-sm text-blue-600 hover:text-blue-800 text-center"
        >
            <div className="card">
                {/* <div className="card-header">Conductor Login</div> */}
                <div className="card-body">
                    <h2>Conductor Login</h2>
                </div>
                {/* </div> */}
            </div>
    </Link>
    <Link
        to="/passengerLogin"
        className="text-sm text-blue-600 hover:text-blue-800 text-center"
        >
            <div className="card">
                {/* <div className="card-header">Passanger Login</div> */}
                    <div className="card-body">
                        <h2>Passenger Login</h2>
                    </div>
                {/* </div> */}
            </div>
    </Link>
    </div>
    </>
  );
};
