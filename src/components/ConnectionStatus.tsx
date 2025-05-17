/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';

// Extend the Window interface to include the bootstrap property
declare global {
    interface Window {
        bootstrap: {
            Modal: {
                getOrCreateInstance: (element: HTMLElement | null) => {
                    show: () => void;
                    hide: () => void;
                };
            };
        };
    }
}
import axios from 'axios';
import Config from '../helpers/Config';

const ConnectionStatus = () => {

    const baseUrl = Config[0].BASE_URL;

    const [isConnected, setIsConnected] = useState(true);
    const [message] = useState("You're offline. Please check your internet connection.");


    const checkInternet = useCallback(async () => {
        try {
            await axios.get(`${baseUrl}/products`);
            setIsConnected(true)
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsConnected(false);
        }
    }, [baseUrl]);

    useEffect(() => {
        const interval = setInterval(checkInternet, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isConnected) {
            window.bootstrap.Modal.getOrCreateInstance(document.getElementById('Lock_Modal')).show();
        } else {
            window.bootstrap.Modal.getOrCreateInstance(document.getElementById('Lock_Modal')).hide();
        }
    }, [isConnected]);

    return (
        <>
            <div className="modal fade modal-blur" id="Lock_Modal" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="Lock_ModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <hr className='custom-hr-1' />
                        <div className="modal-body">
                            <div className='row'>
                                <div className="col text-center">
                                    <h4 className="text-danger">{message}</h4>
                                    <p>We are trying to reconnect...</p>
                                </div>
                            </div>
                        </div>
                        <hr className='custom-hr-1' />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConnectionStatus;
