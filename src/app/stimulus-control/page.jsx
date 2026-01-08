"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle, Heart, AlertTriangle } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function StimulusControlPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stimulusControl, setStimulusControl] = useState("");
  const [existingStimulusControl, setExistingStimulusControl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [stimulusControls, setStimulusControls] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (user?.role === 'administrator') {
      fetchStudentsAndControls();
    } else if (user?.student) {
      fetchStimulusControl();
    }
  }, [user]);

  const fetchStudentsAndControls = async () => {
    setLoadingStudents(true);
    try {
      const [studentsRes, controlsRes] = await Promise.all([
        api.get('/students'),
        api.get('/stimulus-controls')
      ]);
      setStudents(studentsRes.data);
      setStimulusControls(controlsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStimulusControl = async () => {
    try {
      const response = await api.get('/stimulus-controls');
      const controls = response.data.data;
      const userControl = controls.find(control => control.student_id === user.student.id);
      if (userControl) {
        setExistingStimulusControl(userControl);
        setStimulusControl(userControl.value);
      }
    } catch (error) {
      console.error("Error fetching stimulus control:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stimulusControl.trim()) {
      toast.error("Stimulus control tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      if (existingStimulusControl) {
        await api.put(`/stimulus-controls/${existingStimulusControl.id}`, {
          value: stimulusControl.trim(),
        });
        toast.success("Stimulus control berhasil diperbarui!");
      } else {
        await api.post('/stimulus-controls', {
          student_id: user.student.id,
          value: stimulusControl.trim(),
        });
        toast.success("Stimulus control berhasil disimpan!");
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving stimulus control:", error);
      toast.error("Gagal menyimpan stimulus control");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <LoadingSpinner />
      </ProtectedRoute>
    );
  }

  // Admin view
  if (user.role === 'administrator') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-purple-600 mb-3">
                  Manajemen Stimulus Control Siswa
                </h1>
                <p className="text-gray-600 text-lg">
                  Pantau status stimulus control semua siswa
                </p>
                <div className="w-24 h-1 bg-purple-500 rounded-full mx-auto mt-4"></div>
              </div>

              {loadingStudents ? (
                <LoadingSpinner />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-purple-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Daftar Siswa dan Stimulus Control
                    </h2>
                    <p className="text-purple-100">
                      Status stimulus control semua siswa
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Siswa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stimulus Control
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => {
                            // Find stimulus control for this student
                            const stimulusControl = stimulusControls.find(control => control.student_id === student.id);
                            return (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {student.fullname}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {student.grade?.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {stimulusControl ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Sudah Dibuat
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <Heart className="h-3 w-3 mr-1" />
                                      Belum Dibuat
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {stimulusControl ? (
                                    <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200 max-w-md">
                                      <div className="line-clamp-3">
                                        {stimulusControl.value}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500 italic">
                                      Belum ada stimulus control
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Check if user has self-contract first
  if (!user.student?.self_contract || user.student.self_contract.trim() === "") {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-6">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Akses Ditolak
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Anda harus membuat Self Contract terlebih dahulu sebelum dapat mengakses Stimulus Control.
              </p>
              <button
                onClick={() => router.push('/self-contract')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Buat Self Contract Dulu
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (fetchLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <LoadingSpinner />
        </Layout>
      </ProtectedRoute>
    );
  }

  // If stimulus control exists, show read-only view
  if (existingStimulusControl) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Stimulus Control
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ini adalah Stimulus Control yang telah Anda buat. Ini membantu Anda mengontrol stimulus untuk tetap disiplin!
                </p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
                  <h2 className="text-xl font-semibold text-white">
                    Kontrol Stimulus Saya
                  </h2>
                  <p className="text-green-100 mt-1">
                    Strategi untuk mengontrol stimulus negatif
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 text-lg leading-relaxed">
                      {existingStimulusControl.value}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
                  >
                    <div className="flex items-center justify-center">
                      <Heart className="h-6 w-6 mr-3" />
                      Kembali ke Dashboard
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8">
                <p className="text-gray-500 text-sm">
                  Stimulus Control membantu Anda mengelola lingkungan untuk mendukung kebiasaan positif
                </p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Form for creating new stimulus control
  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Stimulus Control
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Sekarang, tuliskan strategi Stimulus Control Anda. Bagaimana Anda akan mengatur lingkungan untuk mendukung kebiasaan disiplin?
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Kontrol Stimulus Saya
                </h2>
                <p className="text-green-100 mt-1">
                  Tuliskan strategi untuk mengontrol stimulus negatif
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <textarea
                    value={stimulusControl}
                    onChange={(e) => setStimulusControl(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 text-lg leading-relaxed"
                    rows={8}
                    required
                    placeholder="Contoh: Saya akan meletakkan buku di meja belajar agar mudah diakses, menghilangkan gadget dari kamar tidur, dll."
                  />
                  {stimulusControl.trim() === "" && (
                    <p className="text-red-500 text-sm mt-2">
                      Stimulus control wajib diisi
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !stimulusControl.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 mr-3" />
                      Simpan Stimulus Control
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Stimulus Control membantu Anda mengelola lingkungan untuk mendukung kebiasaan positif
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}