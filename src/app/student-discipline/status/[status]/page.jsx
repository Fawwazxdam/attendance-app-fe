"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import { rewardPunishmentRecordsApi } from "@/services/api";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import useSWR from 'swr';
import toast from 'react-hot-toast';

export default function AttendanceStatusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const status = params.status;
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedAttendances, setSelectedAttendances] = useState([]);

  // Get query parameters
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const gradeId = searchParams.get('grade_id') || '';

  // Fetch data using SWR
  const { data: gradesData, error: gradesError } = useSWR('/grades', {
    onError: (error) => {
      toast.error('Gagal memuat data kelas');
      console.error('Grades error:', error);
    }
  });

  const attendanceKey = `/attendances?date=${date}&status=${status}${gradeId ? `&grade_id=${gradeId}` : ''}`;
  const { data: attendanceData, error: attendanceError, mutate } = useSWR(attendanceKey, {
    onError: (error) => {
      toast.error('Gagal memuat data absensi');
      console.error('Attendance error:', error);
    }
  });

  const grades = gradesData || [];
  const data = attendanceData;
  const loading = !gradesData || !attendanceData;
  const error = gradesError || attendanceError;
  console.log('attendance data:', data);

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

  const handleCompletePunishment = async (recordId) => {
    if (confirm('Apakah Anda yakin ingin menandai hukuman ini sebagai selesai?')) {
      try {
        await rewardPunishmentRecordsApi.update(recordId, {
          status: 'done',
          notes: 'Hukuman telah dieksekusi melalui sistem absensi'
        });

        toast.success('Hukuman berhasil ditandai selesai');
        // Re-fetch data using SWR mutate
        mutate();
      } catch (error) {
        console.error('Error completing punishment:', error);
        toast.error(error.message || 'Gagal menandai hukuman selesai');
      }
    }
  };

  const handlePhotoClick = (medias) => {
    console.log('Medias clicked:', medias);
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    if (medias && medias.length > 0) {
      setSelectedPhoto(medias); // Pass all medias array
      setShowPhotoModal(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedAttendances.length === data.attendances.length) {
      setSelectedAttendances([]);
    } else {
      setSelectedAttendances(data.attendances.map(attendance => attendance.id));
    }
  };

  const handleSelectAttendance = (attendanceId) => {
    setSelectedAttendances(prev =>
      prev.includes(attendanceId)
        ? prev.filter(id => id !== attendanceId)
        : [...prev, attendanceId]
    );
  };

  const handleBulkCompletePunishment = async () => {
    if (selectedAttendances.length === 0) {
      toast.error('Pilih setidaknya satu siswa untuk menandai hukuman selesai');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menandai hukuman ${selectedAttendances.length} siswa sebagai selesai?`)) {
      try {
        // Collect all pending record IDs from selected attendances
        const recordIds = [];
        selectedAttendances.forEach(attendanceId => {
          const attendance = data.attendances.find(a => a.id === attendanceId);
          console.log("attendance for ID", attendanceId, ":", attendance);
          if (attendance && attendance.punishmentRecords) {
            console.log('Attendance punishment records:', attendance.punishmentRecords);
            const pendingRecord = attendance.punishmentRecords.find(record => record.status === 'pending');
            if (pendingRecord) {
              recordIds.push(pendingRecord.id);
            }
          }
        });

        console.log('Selected attendances:', selectedAttendances);
        console.log('Collected record IDs:', recordIds);

        if (recordIds.length === 0) {
          toast.error('Tidak ada hukuman pending yang dapat ditandai selesai');
          return;
        }

        // Call bulk update endpoint using API service
        await rewardPunishmentRecordsApi.bulkUpdateDone(
          recordIds,
          'Hukuman telah dieksekusi melalui sistem absensi (bulk update)'
        );

        toast.success(`Hukuman ${selectedAttendances.length} siswa berhasil ditandai selesai`);
        setSelectedAttendances([]);

        // Re-fetch data using SWR mutate
        mutate();
      } catch (error) {
        console.error('Error completing bulk punishment:', error);
        toast.error(error.message || 'Gagal menandai hukuman selesai');
      }
    }
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

          {/* Bulk Actions */}
          {status === 'late' && data && data.attendances && data.attendances.length > 0 && (
            <div className="bg-white shadow-xl rounded-2xl border border-purple-100 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAttendances.length} siswa dipilih
                  </span>
                  <button
                    onClick={handleBulkCompletePunishment}
                    disabled={selectedAttendances.length === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Tandai Hukuman Selesai ({selectedAttendances.length})
                  </button>
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
                      {status === 'late' && (
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedAttendances.length === data.attendances.length && data.attendances.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                        </th>
                      )}
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
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                      >
                        {status === 'late' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedAttendances.includes(attendance.id)}
                              onChange={() => handleSelectAttendance(attendance.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendance.student?.fullname || attendance.user?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.student?.grade?.name || (attendance.user ? "Administrator" : "N/A")}
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
                            {attendance.student?.student_point?.total_points || (attendance.user ? 'N/A' : 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {attendance.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.attendance_status === 'late' && attendance.punishmentRecords ? (
                            attendance.punishmentRecords.length > 0 ? (
                              attendance.punishmentRecords.some(record => record.status === 'done') ? (
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
                          {attendance.attendance_status === 'late' && attendance.punishmentRecords && attendance.punishmentRecords.some(record => record.status === 'pending') && (
                            <button
                              onClick={() => handleCompletePunishment(attendance.punishmentRecords.find(record => record.status === 'pending').id)}
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
                              onClick={() => handlePhotoClick(attendance.medias)}
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
              <StatusIcon className={`h-12 w-12 text-${statusInfo.color}-400 mx-auto mb-4`} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Siswa {statusInfo.title.split(' ')[1]}
              </h3>
              <p className="text-gray-500">
                Tidak ada siswa dengan status {statusInfo.title.toLowerCase()} untuk tanggal {new Date(date).toLocaleDateString('id-ID')}.
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
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${encodeURIComponent(media.path)}`}
                        alt={`Foto Absensi ${index + 1}`}
                        className="max-w-full max-h-96 object-contain rounded-lg mx-auto"
                        onLoad={() => console.log('Image loaded successfully:', media.path)}
                        onError={(e) => {
                          console.error('Failed to load image:', media.path);
                          console.error('Full URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${encodeURIComponent(media.path)}`);
                          console.error('Response status:', e.target.status);
                          console.error('Response headers:', e.target.getAllResponseHeaders?.());
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'text-red-500 text-sm mt-2';
                          errorDiv.textContent = 'Gagal memuat gambar';
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