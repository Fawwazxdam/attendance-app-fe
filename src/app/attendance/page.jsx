"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Camera,
  Upload,
  X,
} from "lucide-react";
import api from "@/services/api";
import useSWR from "swr";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Webcam from "react-webcam";

export default function AttendancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendancesList, setAttendancesList] = useState([]);
  const [alreadyAttended, setAlreadyAttended] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState(null);
  const [formData, setFormData] = useState({
    remarks: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        // Get today's date in Jakarta timezone to match backend timezone
        const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
        console.log("[DEBUG] Fetching attendance for date:", today);
        console.log("[DEBUG] Current Jakarta time:", new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"}));
        const response = await api.get(`/attendances?date=${today}`);
        console.log("[DEBUG] API Response:", response.data);

        // Handle both response formats: attendance (students) and attendances (admins)
        if (response.data.attendance) {
          // Student response
          const attendance = response.data.attendance;
          console.log("[DEBUG] Student attendance found:", attendance);
          console.log("[DEBUG] Attendance date:", attendance.date);
          console.log("[DEBUG] Attendance updated_at:", attendance.updated_at);
          setAttendanceData(attendance);
          // Allow attendance submission if status is 'absent'
          setAlreadyAttended(attendance.status !== 'absent');
          setAttendanceTime(new Date(attendance.updated_at));
          console.log("[DEBUG] Set attendanceTime to:", new Date(attendance.updated_at).toString());
        } else if (response.data.attendances) {
          // Admin/Teacher response - list of all attendances
          const attendances = response.data.attendances;
          console.log("[DEBUG] Admin attendances list:", attendances);
          setAttendancesList(attendances);
          // Check if current user has attended
          const userAttendance = attendances.find(att => att.student_id === user.student?.id);
          if (userAttendance) {
            console.log("[DEBUG] User attendance found:", userAttendance);
            console.log("[DEBUG] User attendance date:", userAttendance.date);
            console.log("[DEBUG] User attendance updated_at:", userAttendance.updated_at);
            setAttendanceData(userAttendance);
            // Allow attendance submission if status is 'absent'
            setAlreadyAttended(userAttendance.attendance_status !== 'absent');
            setAttendanceTime(new Date(userAttendance.updated_at));
            console.log("[DEBUG] Set attendanceTime to:", new Date(userAttendance.updated_at).toString());
          } else {
            console.log("[DEBUG] No user attendance found in list");
          }
        } else {
          console.log("[DEBUG] No attendance data in response");
        }
      } catch (error) {
        console.log("[DEBUG] Error in fetchTodayAttendance:", error);
        // If no attendance found, that's fine
        if (error.response?.status !== 404) {
          console.error("Error fetching today's attendance:", error);
          toast.error("Gagal memuat data absensi hari ini");
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchTodayAttendance();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50 border-green-200";
      case "excused":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "late":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "excused":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "late":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const startCamera = () => {
    setShowCamera(true);
    setCameraLoading(true);
    // Set loading to false after a short delay to allow Webcam to initialize
    setTimeout(() => setCameraLoading(false), 1000);
  };

  const stopCamera = () => {
    setShowCamera(false);
    setCameraLoading(false);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "camera-photo.jpg", {
              type: "image/jpeg",
            });
            setFormData({ ...formData, photo: file });
            setPhotoPreview(imageSrc);
            stopCamera();
          })
          .catch((error) => {
            console.error("Error converting screenshot to file:", error);
            toast.error("Gagal mengambil foto. Silakan coba lagi.");
          });
      } else {
        toast.error("Gagal mengambil foto. Silakan coba lagi.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if current time is after 12:00 PM (noon)
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    const noon = new Date(jakartaTime);
    noon.setHours(12, 0, 0, 0);

    // if (jakartaTime >= noon) {
    //   toast.error("Absensi tidak dapat dilakukan setelah jam 12:00 siang");
    //   return;
    // }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Tambahkan remarks (required)
      if (!formData.remarks || formData.remarks.trim() === "") {
        alert("Catatan wajib diisi");
        setLoading(false);
        return;
      }
      submitData.append("remarks", formData.remarks);

      // Validasi dan tambahkan foto
      if (formData.photo) {
        // Pastikan formData.photo adalah File object, bukan string
        if (formData.photo instanceof File) {
          submitData.append("images[]", formData.photo);
        } else {
          throw new Error("Invalid photo format");
        }
      } else {
        alert("Please take or upload a photo before submitting");
        setLoading(false);
        return;
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post("/attendances", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAttendanceData(response.data.attendance);
      setSubmitted(true);
      setAlreadyAttended(response.data.attendance.status !== 'absent');
      setAttendanceTime(new Date(response.data.attendance.updated_at_at));

      // Set success modal data and show modal
      setSuccessData({
        time: new Date(response.data.attendance.updated_at),
        status: response.data.attendance.status,
      });
      setShowSuccessModal(true);

      // Clear form
      setFormData({ remarks: "", photo: null });
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 409) {
        toast.error("Anda sudah absen hari ini");
      } else if (error.response?.status === 404) {
        toast.error("Data siswa tidak ditemukan");
      } else if (error.response?.status === 422) {
        const errorMsg = error.response?.data?.message || "Validasi gagal";
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorList = Object.values(errors).flat().join(", ");
          toast.error(`${errorMsg}: ${errorList}`);
        } else {
          toast.error(errorMsg);
        }
      } else if (error.response?.status === 500) {
        toast.error(
          "Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator."
        );
      } else {
        toast.error("Gagal mengirim absensi. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-4xl mx-auto">
              {/* Header Skeleton */}
              <div className="mb-8 text-center">
                <Skeleton height={48} width={300} className="mx-auto mb-3" />
                <Skeleton height={24} width={250} className="mx-auto" />
                <Skeleton
                  height={6}
                  width={96}
                  className="mx-auto mt-4 rounded-full"
                />
              </div>

              {/* Time Display Skeleton */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton circle height={48} width={48} />
                    <div>
                      <Skeleton height={24} width={120} />
                      <Skeleton height={18} width={150} />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton height={16} width={100} />
                    <Skeleton height={20} width={120} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Skeleton */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 p-6">
                    <Skeleton height={24} width={200} />
                    <Skeleton height={16} width={150} className="mt-2" />
                  </div>
                  <div className="p-6">
                    <Skeleton height={20} width={120} className="mb-2" />
                    <Skeleton
                      height={48}
                      width="100%"
                      className="mb-6 rounded-lg"
                    />
                    <Skeleton height={20} width={100} className="mb-2" />
                    <div className="flex space-x-2 mb-6">
                      <Skeleton height={48} width="50%" />
                      <Skeleton height={48} width="50%" />
                    </div>
                    <Skeleton height={48} width="100%" />
                  </div>
                </div>

                {/* Info Card Skeleton */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-purple-600 p-6">
                    <Skeleton height={24} width={180} />
                    <Skeleton height={16} width={130} className="mt-2" />
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <Skeleton circle height={20} width={20} />
                          <div>
                            <Skeleton height={18} width={80} />
                            <Skeleton height={14} width={120} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Skeleton height={14} width="100%" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (loading && !submitted) {
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
                Jurnal Kehadiran Harian
              </h1>
              <p className="text-gray-600 text-lg">
                Kirim absensi Anda untuk hari ini
              </p>
              <div className="w-24 h-1 bg-purple-500 rounded-full mx-auto mt-4"></div>
            </div>

            {/* Time Display */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatTime(currentTime)}
                    </h3>
                    <p className="text-gray-600">{formatDate(currentTime)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Zona Waktu</p>
                  <p className="font-medium text-gray-900">
                    Asia/Jakarta (WIB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attendance Form */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Kirim Kehadiran
                  </h2>
                  <p className="text-blue-100">
                    Tandai kehadiran Anda hari ini
                  </p>
                </div>

                {!submitted && (!alreadyAttended || (attendanceData?.status === 'absent')) ? (
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto (Wajib)
                      </label>
                      <div className="space-y-3">
                        {showCamera && (
                          <div className="relative mb-4">
                            {cameraLoading ? (
                              <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                  <p className="text-gray-600 text-sm">
                                    Memuat kamera...
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                  facingMode: "environment", // Try back camera first
                                }}
                                onUserMedia={() => {
                                  console.log("Camera ready");
                                  setCameraLoading(false);
                                }}
                                onUserMediaError={(error) => {
                                  console.error("Webcam error:", error);
                                  let errorMessage = "Gagal mengakses kamera. ";
                                  if (error.name === "NotAllowedError") {
                                    errorMessage += "Pastikan Anda memberikan izin akses kamera di browser.";
                                  } else if (error.name === "NotFoundError") {
                                    errorMessage += "Tidak ada kamera yang ditemukan di perangkat Anda.";
                                  } else {
                                    errorMessage += "Silakan coba lagi.";
                                  }
                                  toast.error(errorMessage);
                                  stopCamera();
                                }}
                                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                style={{ transform: "scaleX(-1)" }} // Mirror effect for selfie camera
                              />
                            )}
                            {!cameraLoading && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  Capture
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {photoPreview && !showCamera && (
                          <div className="relative mb-4">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setFormData({ ...formData, photo: null });
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {!showCamera && (
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <Camera className="h-5 w-5 text-gray-600 mr-2" />
                              <span className="text-sm text-gray-700">
                                Ambil Foto
                              </span>
                            </button>
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                              />
                              <div className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <Upload className="h-5 w-5 text-gray-600 mr-2" />
                                <span className="text-sm text-gray-700">
                                  Unggah File
                                </span>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-900" />
                        <textarea
                          value={formData.remarks}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              remarks: e.target.value,
                            })
                          }
                          placeholder="Tambahkan catatan tentang kehadiran Anda..."
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900"
                          rows={4}
                          required
                        />
                      </div>
                      {formData.remarks.trim() === "" && (
                        <p className="text-red-500 text-xs mt-1">
                          Catatan wajib diisi
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading || !formData.photo || !formData.remarks.trim()
                      }
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Simpan kehadiran
                        </div>
                      )}
                    </button>
                  </form>
                ) : alreadyAttended ? (
                  <div className="p-6 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                        {attendanceData?.status === 'absent' ? 'Status Absent - Kirim Ulang Absensi' : 'Sudah Absen Hari Ini'}
                      </h3>
                      {attendanceData?.status === 'absent' ? (
                        <p className="text-yellow-700">
                          Status Anda saat ini adalah 'absent'. Silakan kirim ulang absensi untuk mengubah status.
                        </p>
                      ) : (
                        <p className="text-yellow-700">
                          Kamu sudah absen hari ini pada jam{" "}
                          {attendanceTime
                            ? attendanceTime.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Jurnal kehadiran Disimpan!
                      </h3>
                      <p className="text-green-700">
                        Jurnal kehadiran Anda telah dicatat dengan berhasil.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Status or Info Card for Auto-generated Absent */}
              {attendanceData && (
                attendanceData.status === 'absent' && attendanceData.remarks === 'Auto-generated absent record' ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-purple-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Aturan Absensi
                      </h2>
                      <p className="text-purple-100">Informasi penting</p>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">Hadir</h4>
                            <p className="text-sm text-gray-600">
                              Absen sebelum jam 06:45 WIB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Toleransi
                            </h4>
                            <p className="text-sm text-gray-600">
                              Absen antara jam 06:45 - 07:00 WIB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Terlambat
                            </h4>
                            <p className="text-sm text-gray-600">
                              Absen setelah jam 07:00 WIB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Catatan:</strong> Anda hanya dapat mengirim
                          absensi sekali per hari sebelum jam 12:00 siang. Pastikan untuk mengirim tepat
                          waktu! <br /> Tidak absen sebelum jam 12:00 siang akan
                          dianggap tidak hadir.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-green-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Status kehadiran
                      </h2>
                      <p className="text-green-100">Detail kehadiran hari ini</p>
                    </div>

                    <div className="p-6">
                      <div
                        className={`border rounded-lg p-4 mb-4 ${getStatusColor(
                          attendanceData.status
                        )}`}
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(attendanceData.status)}
                          <div>
                            <h4 className="font-semibold capitalize">
                              {attendanceData.status}
                            </h4>
                            <p className="text-sm opacity-75">
                              Status untuk {attendanceData.date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Tanggal</span>
                          <span className="font-medium text-gray-700">
                            {attendanceData.date}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Waktu Dikirim</span>
                          <span className="font-medium text-gray-700">
                            {new Date(
                              attendanceData.updated_at
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {attendanceData.remarks && (
                          <div className="py-2">
                            <span className="text-gray-600 block mb-1">
                              Catatan
                            </span>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {attendanceData.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Attendance List for Admin/Teacher */}
              {attendancesList.length > 0 && (user.role === 'administrator' || user.role === 'teacher') ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-purple-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Daftar Kehadiran Siswa
                    </h2>
                    <p className="text-purple-100">Status kehadiran semua siswa hari ini</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {attendancesList.map((attendance) => (
                        <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(attendance.attendance_status || attendance.status)}
                            <div>
                              <p className="font-medium text-gray-900">{attendance.student?.fullname}</p>
                              <p className="text-sm text-gray-600">{attendance.student?.grade?.name}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(attendance.attendance_status || attendance.status)}`}>
                            {attendance.attendance_status || attendance.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Info Card for Students */
                !attendanceData && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-purple-600 p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        Aturan Absensi
                      </h2>
                      <p className="text-purple-100">Informasi penting</p>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">Hadir</h4>
                            <p className="text-sm text-gray-600">
                              Absen sebelum jam 06:45 WIB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Toleransi
                            </h4>
                            <p className="text-sm text-gray-600">
                              Absen antara jam 06:45 - 07:00 WIB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Terlambat
                            </h4>
                            <p className="text-sm text-gray-600">
                              Absen setelah jam 07:00 WIB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Catatan:</strong> Anda hanya dapat mengirim
                          absensi sekali per hari sebelum jam 12:00 siang. Pastikan untuk mengirim tepat
                          waktu! <br /> Tidak absen sebelum jam 12:00 siang akan
                          dianggap tidak hadir.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Absensi Berhasil"
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <CheckCircle className="h-20 w-20 text-green-600" />
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Absensi Berhasil Dikirim!
            </h3>
            <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Waktu:</span>
                <span className="text-gray-900">
                  {successData?.time
                    ? `${successData.time
                        .getHours()
                        .toString()
                        .padStart(2, "0")} : ${successData.time
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")} : ${successData.time
                        .getSeconds()
                        .toString()
                        .padStart(2, "0")}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Status:</span>
                <span
                  className={`font-semibold capitalize ${
                    successData?.status === "present"
                      ? "text-green-600"
                      : successData?.status === "excused"
                      ? "text-yellow-600"
                      : successData?.status === "late"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {successData?.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Tutup
            </button>
          </div>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
