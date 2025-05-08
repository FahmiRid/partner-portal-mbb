import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../heroSection/footer';

export default function MaybankLoginPage() {
    const [pfNumber, setPfNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Dummy local storage credentials
    const dummyCredentials = {
        pfNumber: '12345678',
        password: '123',
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempted with:', { pfNumber, password });

        if (pfNumber === dummyCredentials.pfNumber && password === dummyCredentials.password) {
            // Set the user's credentials in local storage
            localStorage.setItem('pfNumber', pfNumber);
            localStorage.setItem('password', password);
      
            // Redirect the user to the ppHomepage.tsx page
            navigate('/home');
        } else {
            setError('Invalid PF Number or Password');
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Yellow Header */}
            {/* <header className="bg-warning py-3 shadow">
                <div className="container">
                    <Header />
                </div>
            </header> */}

            {/* Login Form */}
            <div className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
                    <div className="card-body p-4 p-md-5">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold mb-2">Partner Portal</h2>
                            <p className="text-muted">Please enter your credentials to access the system</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="pfNumber" className="form-label fw-semibold">PF Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="pfNumber"
                                    value={pfNumber}
                                    onChange={(e) => setPfNumber(e.target.value)}
                                    placeholder="Enter your PF Number"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <button
                                    type="submit"
                                    className="btn btn-warning w-100 fw-bold py-2"
                                >
                                    Login
                                </button>
                            </div>

                            {/* Warning Message */}
                            <div className="alert alert-danger text-center small">
                                Use of this system is restricted to activities and purposes authorised by Maybank Group Management. Unauthorised use may result in disciplinary action and/or legal prosecution.
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}