"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push("/login");
    } else {
      const data = await response.json();
      setError(data.error || "Registration failed");
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center mt-10">
        <h1 className="text-3xl font-bold text-brand-red">Create Account</h1>
        <p className="text-gray-500">Enter your information to register</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center" role="alert">
            {error}
          </div>
        )}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-brand-blue hover:bg-blue-700 text-white rounded-md"
          >
            Register
          </button>
        </div>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </form>
    </div>
  );
}
