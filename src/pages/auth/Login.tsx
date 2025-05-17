import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isAuthenticated } from "../../utils/SessionManager";
import { useAuthStore } from "../../utils/authStore"; 

const Login = () => {
  
  // useNavigate is a hook that returns a function that lets you navigate programmatically
  const navigate = useNavigate();

  const { loading, error, setLoading, setError, clearAuthState } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // Function to toggle password visibility, This function is called when the user clicks the eye icon next to the password input field It toggles the type of the password input between 'password' and 'text' to show or hide the password
  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.input-group-text');

    const isPasswordVisible = toggleIcon.getAttribute('data-password') === 'true';

    if (isPasswordVisible) {
      passwordInput.type = 'password';
      toggleIcon.setAttribute('data-password', 'false');
    } else {
      passwordInput.type = 'text';
      toggleIcon.setAttribute('data-password', 'true');
    }
  }

  // Function to handle login, This function is called when the user clicks the login button It retrieves the username and password from the input fields and checks if they are not empty If they are empty, it sets an error message and returns If they are not empty, it sets the loading state to true and clears any previous error messages
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const userData = {
        role: 'Admin',
        name: username,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      clearAuthState(); 
      window.location.href = '/admin/dashboard';
    }, 1000);
  }

  return (
    <div className="row justify-content-center">
      <div className="col-xxl-5 col-lg-5">
        <div className="card">
          <div className="card-header py-4 text-center bg-primary">
            <a href="index.html">
              <span><img src="/assets/images/logo-white.png" alt="logo" height={38} /></span>
            </a>
          </div>
          <div className="card-body p-3">
            <div className="text-center w-50 m-auto">
              <h4 className="text-dark-50 text-center text-uppercase fw-bold">Log in to your account</h4>
            </div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Enter your username</label>
                <input className="form-control" type="text" id="username" />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Provide password</label>
                <div className="input-group input-group-merge">
                  <input type="password" id="password" className="form-control" />
                  <div className="input-group-text" data-password="false" onClick={togglePasswordVisibility}>
                    <span className="password-eye" />
                  </div>
                </div>
              </div>
              <div className="mb-3 mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="checkbox-signin" defaultChecked />
                  <label className="form-check-label" htmlFor="checkbox-signin">Remember me</label>
                </div>
              </div>
              <div className="mb-3 mb-0 text-center">
                <button className="btn btn-primary" type="button" disabled={loading} onClick={handleLogin}>
                  {loading ? 'Authenticating...' : 'Continue to Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
