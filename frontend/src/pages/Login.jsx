import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import axios from 'axios';
export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

  try {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    console.log("Login Successful:", data);
    window.location.href = "/serverPage";
  } catch (error) {
    console.error("Login Error:", error.message);
  }

  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue to SoulSync"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button type="submit" fullWidth>
          Sign In
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