"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import { Eye, EyeOff, School, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      setError("Failed to log in: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-600/70 to-purple-700/60"></div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <div className="mb-8">
                <School className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h1 className="text-4xl font-bold mb-4">Jurnal Kehadiran</h1>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm mx-auto">
                <h3 className="text-lg font-semibold mb-2">Lacak jurnal kehadiran dengan Mudah</h3>
                <p className="text-sm opacity-90">
                  Pantau kehadiran siswa, kelola catatan, dan pastikan pelacakan jurnal kehadiran yang akurat.
                </p>
              </div>
              <div className="text-white">
                <p className="text-sm opacity-90">
                  Untuk panduan penggunaan silahkan klik <a href="https://drive.google.com/file/d/1VZA-cyud4vLX4lAYanyGVPqeVgvKgFaD/view?usp=sharing" className="underline hover:underline" target="_blank"> Link berikut</a>
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat datang kembali 👋
            </h2>
            <p className="text-gray-600">
              Masuk ke akun Jurnal Kehadiran Anda
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kata Sandi
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Lupa kata sandi?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi Anda"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Masuk...
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Footer */}
            {/* <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Baru di Absensi Siswa?{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Buat akun
                </a>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
