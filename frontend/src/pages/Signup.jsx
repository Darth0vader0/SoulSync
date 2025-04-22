
// src/components/Signup.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import {
  generateKeyPair,
  exportKeys,
  savePrivateKey,
  sendPublicKeyToBackend
} from '../utils/crypto';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Basic sanitizer to strip dangerous characters
const sanitizeInput = (str) => str.replace(/[<>'"%;()&+]/g, '').trim();

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    const injectionPattern = /('|--|;|\/\*|\*\/|xp_|union|select|drop|insert|delete|update)/i;

    // Validate inputs
    if (!usernameRegex.test(formData.username)) {
      return setError("Username must be at least 3 characters and use only letters, numbers, or underscores.");
    }
    if (!emailRegex.test(formData.email)) {
      return setError("Please enter a valid email address.");
    }
    if (!passwordRegex.test(formData.password)) {
      return setError("Password must be at least 8 characters long and contain at least one letter and one number.");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (injectionPattern.test(formData.username) || injectionPattern.test(formData.email)) {
      return setError("Malicious patterns detected in input.");
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Generate RSA key pair client-side
      const keyPair = await generateKeyPair();
      // Export keys to PEM
      const { publicKeyPEM, privateKeyPEM } = await exportKeys(keyPair);

      // First register user and get their userId
      const signupRes = await fetch(`${backendUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: sanitizeInput(formData.username),
          email: sanitizeInput(formData.email),
          password: formData.password
        }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        throw new Error(signupData.message || "Signup failed");
      }
      console.log("Signup Response:", signupData);

      const userId = signupData.user._id;

      // Send public key to backend for storage
      await sendPublicKeyToBackend(userId, publicKeyPEM);
      // Save private key locally for decrypting messages
      savePrivateKey(privateKeyPEM);

      console.log("🔐 Key pair generated and stored successfully.", signupData);
      window.location.href = "/login";
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join SoulSync and start sharing music with friends"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-500 text-center font-medium">
            {error}
          </div>
        )}

        <Input
          label="Username"
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />

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
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </Button>

        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

