"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import { rewardPunishmentRecordsApi } from "@/services/api";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import {
  Filter,
  Award,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  X,
  Download,
} from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function StudentDisciplinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({
    date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }), // Today's date in Jakarta time
    status: "",
    grade_id: "",
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Fetch data using SWR
  const { data: gradesData, error: gradesError } = useSWR("/grades", {
    onError: (error) => {
      toast.error("Gagal memuat data kelas");
      console.error("Grades error:", error);
    },
  });

  const attendanceKey = `/attendances?date=${filters.date}${
    filters.status ? `&status=${filters.status}` : ""
  }${filters.grade_id ? `&grade_id=${filters.grade_id}` : ""}`;
  const {
    data: attendanceData,
    error: attendanceError,
    mutate: mutateAttendance,
  } = useSWR(attendanceKey, {
    onError: (error) => {
      toast.error("Gagal memuat data absensi");
      console.error("Attendance error:", error);
      console.error("Attendance error response:", error?.response);
      console.error("Attendance error status:", error?.response?.status);
      console.error("Attendance error data:", error?.response?.data);
    },
    onSuccess: (data) => {
      console.log("Attendance success:", data);
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0, // Disable caching
    errorRetryCount: 0, // Don't retry on error
  });

  const grades = gradesData || [];
  const data = attendanceData;
  const loading = !gradesData || !attendanceData;
  const error = gradesError || attendanceError;

  // Re-fetch attendance data when filters change
  useEffect(() => {
    mutateAttendance();
  }, [filters.date, filters.status, filters.grade_id, mutateAttendance]);

  console.log("Attendance data:", data);
  console.log("Attendance key:", attendanceKey);
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
      date: new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      }),
      status: "",
      grade_id: "",
    });
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan");
        return;
      }

      const params = new URLSearchParams({
        date: filters.date,
        ...(filters.status && { status: filters.status }),
        ...(filters.grade_id && { grade_id: filters.grade_id }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendances/export?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `attendances_${filters.date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("File Excel berhasil diunduh");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengunduh file Excel");
    }
  };

  const handleStatusCardClick = (status) => {
    router.push(
      `/student-discipline/status/${status}?date=${filters.date}&grade_id=${filters.grade_id}`
    );
  };

  const handleCompletePunishment = async (recordId) => {
    if (
      confirm("Apakah Anda yakin ingin menandai hukuman ini sebagai selesai?")
    ) {
      try {
        await rewardPunishmentRecordsApi.update(recordId, {
          status: "done",
          notes: "Hukuman telah dieksekusi melalui sistem absensi",
        });

        toast.success("Hukuman berhasil ditandai selesai");
        mutateAttendance(); // Refresh data
      } catch (error) {
        console.error("Error completing punishment:", error);
        toast.error(error.message || "Gagal menandai hukuman selesai");
      }
    }
  };

  const handlePhotoClick = (medias) => {
    console.log("Medias clicked:", medias);
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
    if (medias && medias.length > 0) {
      setSelectedPhoto(medias); // Pass all medias array
      setShowPhotoModal(true);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <Skeleton height={36} width={250} />
                <Skeleton height={20} width={200} className="mt-2" />
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl border border-purple-100 p-6 mb-6">
              <Skeleton height={24} width={100} className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={120} className="rounded-xl" />
              ))}
            </div>

            <div className="bg-white shadow-xl rounded-2xl border border-purple-100 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={150} />
                      <Skeleton height={40} width={100} />
                      <Skeleton height={40} width={80} />
                      <Skeleton height={40} width={60} />
                      <Skeleton height={40} width={100} />
                      <Skeleton height={40} width={60} />
                    </div>
                  ))}
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">
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
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Absensi
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="present">Hadir</option>
                  <option value="late">Terlambat</option>
                  <option value="excused">Toleransi</option>
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
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleExport}
                disabled={
                  !data || !data.attendances || data.attendances.length === 0
                }
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export to Excel</span>
              </button>
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
              <div className="bg-green-600 rounded-xl p-6 text-white">
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
                className="bg-blue-600 rounded-xl p-6 text-white cursor-pointer hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick("present")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Hadir</p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter(
                          (a) =>
                            a.attendance_status === "present" ||
                            a.attendance_status === "excused"
                        ).length
                      }
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div
                className="bg-yellow-600 rounded-xl p-6 text-white cursor-pointer hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick("late")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Terlambat
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter(
                          (a) => a.attendance_status === "late"
                        ).length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>

              <div
                className="bg-red-600 rounded-xl p-6 text-white cursor-pointer hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleStatusCardClick("absent")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">
                      Tidak Hadir
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        data.attendances.filter(
                          (a) => a.attendance_status === "absent"
                        ).length
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
                  <thead className="bg-purple-50">
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
                        Status Hukuman
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Aksi
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
                        className="hover:bg-blue-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendance.student?.fullname ||
                            attendance.user?.name ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.student?.grade?.name ||
                            (attendance.user ? "Administrator" : "N/A")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              attendance.attendance_status === "present"
                                ? "bg-green-100 text-green-800"
                                : attendance.attendance_status === "late"
                                ? "bg-yellow-100 text-yellow-800"
                                : attendance.attendance_status === "excused"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {attendance.attendance_status === "present" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : attendance.attendance_status === "late" ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : attendance.attendance_status === "excused" ? (
                              <Calendar className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {attendance.attendance_status === "present"
                              ? "Hadir"
                              : attendance.attendance_status === "late"
                              ? "Terlambat"
                              : attendance.attendance_status === "excused"
                              ? "Toleransi"
                              : "Tidak Hadir"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.attendance_status != "absent"
                            ? new Date(attendance.updated_at).getHours().toString().padStart(2, '0') + ':' +
                              new Date(attendance.updated_at).getMinutes().toString().padStart(2, '0')
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`font-medium ${
                              attendance.points_earned > 0
                                ? "text-green-600"
                                : attendance.points_earned < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {attendance.points_earned > 0 ? "+" : ""}
                            {attendance.points_earned || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`font-medium ${
                              (attendance.student?.student_point
                                ?.total_points || 0) > 0
                                ? "text-green-600"
                                : (attendance.student?.student_point
                                    ?.total_points || 0) < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {attendance.student?.student_point?.total_points ||
                              (attendance.user ? "N/A" : 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {attendance.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(attendance.attendance_status === "late" || attendance.attendance_status === "absent") &&
                          attendance.punishmentRecords ? (
                            attendance.punishmentRecords.length > 0 ? (
                              attendance.punishmentRecords.some(
                                (record) => record.status === "done"
                              ) ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  ✓ Selesai
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  ⏳ Pending
                                </span>
                              )
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                - Tidak Ada
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(attendance.attendance_status === "late" || attendance.attendance_status === "absent") &&
                            attendance.punishmentRecords &&
                            attendance.punishmentRecords.some(
                              (record) => record.status === "pending"
                            ) && (
                              <button
                                onClick={() =>
                                  handleCompletePunishment(
                                    attendance.punishmentRecords.find(
                                      (record) => record.status === "pending"
                                    ).id
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                                title="Tandai hukuman selesai"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.medias && attendance.medias.length > 0 ? (
                            <button
                              onClick={() =>
                                handlePhotoClick(attendance.medias)
                              }
                              className="text-green-600 font-medium hover:text-green-800 hover:underline cursor-pointer"
                            >
                              ✓ Ada
                            </button>
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

          {/* Photo Modal */}
          <Modal
            isOpen={showPhotoModal}
            onClose={() => {
              setShowPhotoModal(false);
              setSelectedPhoto(null);
            }}
            title="Foto Absensi"
          >
            <div className="text-center">
              {selectedPhoto && selectedPhoto.length > 0 ? (
                <div className="space-y-4">
                  {selectedPhoto.map((media, index) => (
                    <div key={media.id} className="mb-4">
                      <img
                        src={`${
                          process.env.NEXT_PUBLIC_API_BASE_URL
                        }/storage/${encodeURIComponent(media.path)}`}
                        alt={`Foto Absensi ${index + 1}`}
                        className="max-w-full max-h-96 object-contain rounded-lg mx-auto"
                        onLoad={() =>
                          console.log("Image loaded successfully:", media.path)
                        }
                        onError={(e) => {
                          console.error("Failed to load image:", media.path);
                          console.error(
                            "Full URL:",
                            `${
                              process.env.NEXT_PUBLIC_API_BASE_URL
                            }/storage/${encodeURIComponent(media.path)}`
                          );
                          console.error("Response status:", e.target.status);
                          console.error(
                            "Response headers:",
                            e.target.getAllResponseHeaders?.()
                          );
                          e.target.style.display = "none";
                          const errorDiv = document.createElement("div");
                          errorDiv.className = "text-red-500 text-sm mt-2";
                          errorDiv.textContent = "Gagal memuat gambar";
                          e.target.parentNode.appendChild(errorDiv);
                        }}
                      />
                      {selectedPhoto.length > 1 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Foto {index + 1} dari {selectedPhoto.length}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada foto yang tersedia</p>
              )}
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                }}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
