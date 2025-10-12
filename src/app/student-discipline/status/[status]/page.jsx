"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
} from "lucide-react";
import api from "@/services/api";

export default function AttendanceStatusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const status = params.status;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  // Get query parameters
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const gradeId = searchParams.get('grade_id') || '';

  useEffect(() => {
    fetchGrades();
    fetchData();
  }, [status, date, gradeId]);

  const fetchGrades = async () => {
    try {
      const response = await api.get("/grades");
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("date", date);
      params.append("status", status);
      if (gradeId) params.append("grade_id", gradeId);

      const response = await api.get(`/attendances?${params}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "administrator") {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Akses Ditolak
              </h2>
              <p className="text-gray-600">
                Anda tidak memiliki izin untuk mengakses halaman ini.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'present':
        return {
          title: 'Siswa Hadir',
          description: 'Daftar siswa yang hadir tepat waktu',
          color: 'green',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'late':
        return {
          title: 'Siswa Terlambat',
          description: 'Daftar siswa yang datang terlambat',
          color: 'yellow',
          icon: Clock,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'absent':
        return {
          title: 'Siswa Tidak Hadir',
          description: 'Daftar siswa yang tidak hadir',
          color: 'red',
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          title: 'Status Tidak Dikenal',
          description: 'Status absensi tidak valid',
          color: 'gray',
          icon: AlertTriangle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <LoadingSpinner />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-8 w-8" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {statusInfo.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {statusInfo.description} - {new Date(date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-xl p-6 mb-6`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-${statusInfo.color}-100`}>
                <StatusIcon className={`h-8 w-8 text-${statusInfo.color}-600`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${statusInfo.textColor}`}>
                  {data?.attendances?.length || 0} Siswa
                </h3>
                <p className="text-gray-600">
                  Total siswa dengan status {statusInfo.title.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          {data && data.attendances && data.attendances.length > 0 ? (
            console.log(data.attendances),
            <div className="bg-white shadow-xl rounded-2xl border border-purple-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-100">
                  <thead className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Nama Siswa
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Waktu Absensi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Poin Diterima
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Total Poin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Catatan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Foto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.attendances.map((attendance) => (
                      <tr
                        key={attendance.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendance.student?.fullname || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.student?.grade?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(attendance.created_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-medium ${
                            attendance.points_earned > 0 ? 'text-green-600' :
                            attendance.points_earned < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {attendance.points_earned > 0 ? '+' : ''}{attendance.points_earned || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-medium ${
                            (attendance.student?.student_point?.total_points || 0) > 0 ? 'text-green-600' :
                            (attendance.student?.student_point?.total_points || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {attendance.student?.student_point?.total_points || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {attendance.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.medias && attendance.medias.length > 0 ? (
                            <span className="text-green-600 font-medium">
                              ✓ Ada
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl border border-purple-100 p-12 text-center">
              <StatusIcon className={`h-12 w-12 text-${statusInfo.color}-400 mx-auto mb-4`} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Siswa {statusInfo.title.split(' ')[1]}
              </h3>
              <p className="text-gray-500">
                Tidak ada siswa dengan status {statusInfo.title.toLowerCase()} untuk tanggal {new Date(date).toLocaleDateString('id-ID')}.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}