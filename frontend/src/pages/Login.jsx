import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

// Basic sanitization to remove potential injection characters
const sanitizeInput = (str) => str.replace(/[<>'"%;()&+]/g, '').trim();

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const injectionPattern = /('|--|;|\/\*|\*\/|xp_|union|select|drop|insert|delete|update)/i;

    if (!emailRegex.test(formData.email)) {
      return setError("Please enter a valid email address.");
    }
    if (!formData.email || !formData.password) {
      return setError("Both fields are required.");
    }
    if (injectionPattern.test(formData.email)) {
      return setError("Malicious patterns detected in email.");
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("https://soulsync-52q9.onrender.com/login", {
        method: "POST",
        credentials: "include", // For cookies/session
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sanitizeInput(formData.email),
          password: formData.password, // Password kept raw for hashing on server
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login Successful:", data);
      window.location.href = "/mainchat";
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue to SoulSync"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-500 text-center font-medium">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="ml-2 text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
