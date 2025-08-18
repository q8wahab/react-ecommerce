import React, { useState } from 'react';
import { Footer, Navbar } from "../components";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../store/auth/slice";
import ApiService from "../services/api";
import toast from "react-hot-toast";

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }
        
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return;
        }
        
        if (!formData.password.trim()) {
            toast.error('Password is required');
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        dispatch(loginStart());
        
        try {
            const response = await ApiService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            console.log("Registration successful:", response);
            
            dispatch(loginSuccess(response.user));
            toast.success("Registration successful! Welcome!");
            
            // Redirect based on user role
            if (response.user.role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/");
            }
            
        } catch (error) {
            console.error("Registration error:", error);
            dispatch(loginFailure(error.message));
            toast.error(error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container my-3 py-3">
                <h1 className="text-center">Register</h1>
                <hr />
                <div className="row my-4 h-100">
                    <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="form my-3">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter Your Name"
                                    required
                                />
                            </div>
                            <div className="form my-3">
                                <label htmlFor="email">Email address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            <div className="form my-3">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                    minLength="6"
                                />
                                <small className="form-text text-muted">
        Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
    </small>
                            </div>
                            
                            <div className="my-3">
                                <p>Already has an account? <Link to="/login" className="text-decoration-underline text-info">Login</Link> </p>
                            </div>
                            <div className="text-center">
                                <button 
                                    className="my-2 mx-auto btn btn-dark" 
                                    type="submit" 
                                    disabled={loading}
                                >
                                    {loading ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Register;
