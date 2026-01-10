"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  AlertCircle,
  Calendar,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SelfMonitoringPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lateAttendances, setLateAttendances] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const fetchLateAttendances = async () => {
      try {
        const response = await api.get("/attendances/late-reasons");
        if (response.data.is_admin) {
          setStudentsData(response.data.students_data || []);
          setIsAdmin(true);
        } else {
          setLateAttendances(response.data.late_attendances || []);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching late attendances:", error);
        toast.error("Gagal memuat data self monitoring");
      } finally {
        setLoading(false);
      }
    };

    fetchLateAttendances();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleRowExpansion = (studentId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-purple-600 mb-3">
                Self Monitoring
              </h1>
              <p className="text-gray-600 text-lg">
                Pantau alasan keterlambatan Anda
              </p>
              <div className="w-24 h-1 bg-purple-500 rounded-full mx-auto mt-4"></div>
            </div>

            {/* Content */}
            {isAdmin ? (
              /* Admin View */
              studentsData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Belum Ada Data Keterlambatan
                    </h2>
                    <p className="text-blue-100">
                      Tidak ada siswa yang memiliki catatan keterlambatan
                    </p>
                  </div>
                  <div className="p-6 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <AlertCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Bagus!
                      </h3>
                      <p className="text-green-700">
                        Semua siswa menunjukkan kedisiplinan yang baik.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-red-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Data Self Monitoring Siswa
                      </h2>
                      <p className="text-red-100">
                        Klik baris siswa untuk melihat detail keterlambatan
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Siswa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kelas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Keterlambatan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Detail
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentsData.map((studentData) => (
                            <React.Fragment key={studentData.student.id}>
                              <tr
                                className={`hover:bg-gray-50 ${studentData.total_lates > 0 ? 'cursor-pointer' : ''}`}
                                onClick={() => studentData.total_lates > 0 && toggleRowExpansion(studentData.student.id)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {studentData.student.fullname}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {studentData.student.grade?.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {studentData.total_lates > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {studentData.total_lates}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      0
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {studentData.total_lates > 0 && (
                                    expandedRows.has(studentData.student.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )
                                  )}
                                </td>
                              </tr>
                              {expandedRows.has(studentData.student.id) && (
                                <tr>
                                  <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        Riwayat Keterlambatan:
                                      </h4>
                                      {studentData.late_attendances.map((attendance) => (
                                        <div
                                          key={attendance.id}
                                          className="border border-red-200 rounded-lg p-3 bg-white"
                                        >
                                          <div className="flex items-start space-x-3">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-2 mb-2">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                <span className="font-medium text-gray-900">
                                                  {formatDate(attendance.date)}
                                                </span>
                                              </div>
                                              <div className="flex items-start space-x-2">
                                                <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                  <p className="text-gray-700 font-medium mb-1">
                                                    Alasan Keterlambatan:
                                                  </p>
                                                  <p className="text-gray-900 bg-red-50 p-2 rounded border border-red-200">
                                                    {attendance.late_reason}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                  Dicatat pada{" "}
                                                  {new Date(attendance.updated_at).toLocaleString("id-ID")}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Admin Summary */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-purple-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Ringkasan Kelas
                      </h2>
                      <p className="text-purple-100">
                        Statistik keterlambatan seluruh siswa
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {studentsData.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Siswa
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {studentsData.filter(s => s.total_lates > 0).length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Siswa dengan Keterlambatan
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">
                            {studentsData.reduce((sum, student) => sum + student.total_lates, 0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Keterlambatan
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {studentsData.length > 0
                              ? Math.round(
                                  (studentsData.reduce((sum, student) => sum + student.total_lates, 0) /
                                    studentsData.length) *
                                    10
                                ) / 10
                              : 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Rata-rata per Siswa
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Student View */
              lateAttendances.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Belum Ada Data
                    </h2>
                    <p className="text-blue-100">
                      Anda belum memiliki catatan keterlambatan
                    </p>
                  </div>
                  <div className="p-6 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <AlertCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Bagus!
                      </h3>
                      <p className="text-green-700">
                        Anda belum pernah terlambat. Tetap jaga kedisiplinan Anda!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-red-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Riwayat Keterlambatan
                      </h2>
                      <p className="text-red-100">
                        Daftar alasan keterlambatan yang telah Anda berikan
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {lateAttendances.map((attendance) => (
                          <div
                            key={attendance.id}
                            className="border border-red-200 rounded-lg p-4 bg-red-50"
                          >
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Calendar className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium text-gray-900">
                                    {formatDate(attendance.date)}
                                  </span>
                                </div>
                                <div className="flex items-start space-x-2">
                                  <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-gray-700 font-medium mb-1">
                                      Alasan Keterlambatan:
                                    </p>
                                    <p className="text-gray-900 bg-white p-3 rounded-lg border border-red-200">
                                      {attendance.late_reason}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    Dicatat pada{" "}
                                    {new Date(attendance.updated_at).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-purple-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Ringkasan
                      </h2>
                      <p className="text-purple-100">
                        Statistik keterlambatan Anda
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {lateAttendances.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Keterlambatan
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {lateAttendances.length > 0
                              ? Math.round(
                                  (new Date() - new Date(lateAttendances[0].date)) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Hari Sejak Terakhir Terlambat
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {lateAttendances.length === 0 ? "100%" : "0%"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Tingkat Kedisiplinan
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}