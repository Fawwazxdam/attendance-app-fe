"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataTable from "@/components/DataTable";
import {
  Filter,
  Award,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "@/services/api";

export default function StudentDisciplinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0], // Today's date
    status: "",
    grade_id: "",
  });
  const [grades, setGrades] = useState([]);

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

      params.append("date", filters.date);
      if (filters.status) params.append("status", filters.status);
      if (filters.grade_id) params.append("grade_id", filters.grade_id);

      const response = await api.get(`/attendances?${params}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchData();
  }, [filters]);

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const resetFilters = () => {
    setFilters({
      date: new Date().toISOString().split("T")[0],
      status: "",
      grade_id: "",
    });
  };

  const handleStatusCardClick = (status) => {
    router.push(`/student-discipline/status/${status}?date=${filters.date}&grade_id=${filters.grade_id}`);
  };

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Rekap Absensi Siswa
              </h1>
              <p className="text-gray-600 mt-1">
                Lihat rekap absensi siswa berdasarkan tanggal
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-xl rounded-2xl border border-purple-100 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filter</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Absensi
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="present">Hadir</option>
                  <option value="late">Terlambat</option>
                  <option value="excused">Izin</option>
                  <option value="absent">Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  value={filters.grade_id}
                  onChange={(e) =>
                    handleFilterChange("grade_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Semua Kelas</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {data && data.attendances && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Total Absensi
                    </p>
                    <p className="text-2xl font-bold">
                      {data.attendances.length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick('present')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Hadir</p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter((a) => a.status === "present")
                          .length
                      }
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white cursor-pointer hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick('late')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Terlambat
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter((a) => a.status === "late")
                          .length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>

              <div
                className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white cursor-pointer hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick('absent')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">
                      Tidak Hadir
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter((a) => a.status === "absent")
                          .length
                      }
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          {data && data.attendances && data.attendances.length > 0 ? (
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
                        Status Absensi
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              attendance.status === "present"
                                ? "bg-green-100 text-green-800"
                                : attendance.status === "late"
                                ? "bg-yellow-100 text-yellow-800"
                                : attendance.status === "excused"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {attendance.status === "present" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : attendance.status === "late" ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : attendance.status === "excused" ? (
                              <Calendar className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {attendance.status === "present"
                              ? "Hadir"
                              : attendance.status === "late"
                              ? "Terlambat"
                              : attendance.status === "excused"
                              ? "Izin"
                              : "Tidak Hadir"}
                          </span>
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
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Data Absensi
              </h3>
              <p className="text-gray-500">
                Tidak ada data absensi untuk tanggal {filters.date} dengan
                filter yang dipilih.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
