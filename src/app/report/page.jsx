"use client";

import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TrendingUp, Users, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const { user } = useAuth();

  // Check if user has permission to view reports
  if (user?.role !== 'teacher' && user?.role !== 'administrator') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Fetch chart data
  const { data: trendData, error: trendError } = useSWR('/charts/attendance-trend?period=month&limit=6');
  const { data: classData, error: classError } = useSWR('/charts/class-performance');
  const { data: statsData, error: statsError } = useSWR('/dashboard/stats');

  // Loading state
  if (!trendData || !classData || !statsData) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="mb-8">
                <Skeleton height={48} width={400} />
                <Skeleton height={24} width={300} className="mt-2" />
              </div>

              {/* Charts Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <Skeleton height={24} width={200} className="mb-4" />
                  <Skeleton height={300} />
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <Skeleton height={24} width={200} className="mb-4" />
                  <Skeleton height={300} />
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Error state
  if (trendError || classError || statsError) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
                  <p className="text-gray-600 mb-4">Gagal memuat data laporan</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-green-600 mb-2">
                Laporan Kehadiran Siswa
              </h1>
              <p className="text-gray-600 text-lg">
                Analisis dan statistik kehadiran siswa secara keseluruhan
              </p>
              <div className="w-24 h-1 bg-green-500 rounded-full mx-auto mt-4"></div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Siswa</p>
                    <p className="text-3xl font-bold text-gray-900">{statsData?.data?.total_students || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Rata-rata Kehadiran</p>
                    <p className="text-3xl font-bold text-gray-900">{statsData?.data?.today_attendance?.rate || 0}%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Kelas</p>
                    <p className="text-3xl font-bold text-gray-900">{statsData?.data?.total_classes || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tidak Hadir Hari Ini</p>
                    <p className="text-3xl font-bold text-gray-900">{statsData?.data?.today_attendance?.absent || 0}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <motion.div
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  Trend Kehadiran 6 Bulan Terakhir
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.data?.datasets?.[0]?.data?.map((value, index) => ({
                      month: trendData.data.labels[index],
                      hadir: value,
                      terlambat: trendData.data.datasets[1].data[index],
                      tidakHadir: trendData.data.datasets[2].data[index]
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={2} name="Hadir" />
                      <Line type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={2} name="Terlambat" />
                      <Line type="monotone" dataKey="tidakHadir" stroke="#EF4444" strokeWidth={2} name="Tidak Hadir" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Class Performance Chart */}
              <motion.div
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Performa Kelas Bulan Ini
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData?.data?.datasets?.[0]?.data?.map((value, index) => ({
                      kelas: classData.data.labels[index],
                      persentase: value
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="kelas" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Kehadiran']} />
                      <Bar dataKey="persentase" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}