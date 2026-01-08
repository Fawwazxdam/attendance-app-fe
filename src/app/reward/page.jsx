"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trophy, CheckCircle, Clock, Users, Award } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function RewardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reward, setReward] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (user?.role === 'administrator') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!user) {
    return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;
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
                  Manajemen Reward Siswa
                </h1>
                <p className="text-gray-600 text-lg">
                  Pantau streak dan reward siswa
                </p>
                <div className="w-24 h-1 bg-purple-500 rounded-full mx-auto mt-4"></div>
              </div>

              {loadingStudents ? (
                <LoadingSpinner />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-purple-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Daftar Siswa dan Reward
                    </h2>
                    <p className="text-purple-100">
                      Status reward semua siswa
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
                              Streak Tidak Telat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status Reward
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reward Diminta
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
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
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">
                                    {student.late_free_streak || 0} hari
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {student.reward_eligible ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Eligible
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Progress
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {student.pending_reward ? (
                                  <div className="text-sm text-gray-900 bg-blue-50 p-2 rounded-lg border border-blue-200">
                                    {student.pending_reward}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 italic">
                                    Belum diminta
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
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

  const streak = user.student?.late_free_streak || 0;
  const eligible = user.student?.reward_eligible || false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reward.trim()) {
      toast.error("Reward tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/students/${user.student.id}`, {
        pending_reward: reward.trim(),
        reward_eligible: false,
        late_free_streak: 0, // Reset streak after claiming
      });
      toast.success("Reward berhasil diklaim!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Gagal mengklaim reward");
    } finally {
      setLoading(false);
    }
  };

  if (!eligible) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full text-center">
              <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Reward Belum Tersedia
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Kamu perlu {5 - streak} hari lagi tanpa telat untuk mendapatkan reward.
              </p>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold">Progress Streak</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(streak / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {streak} dari 5 hari
                </p>
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <Trophy className="h-20 w-20 text-yellow-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 Klaim Reward!
              </h1>
              <p className="text-lg text-gray-600">
                Selamat! Kamu telah {streak} hari berturut-turut tidak telat. Apa reward yang kamu inginkan?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Reward Kamu
                </h2>
                <p className="text-yellow-100 mt-1">
                  Tuliskan reward yang kamu inginkan sebagai hadiah disiplin
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <textarea
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 text-lg leading-relaxed"
                    rows={6}
                    placeholder="Contoh: Jajan di kantin, main game 1 jam, dll..."
                    required
                  />
                  {reward.trim() === "" && (
                    <p className="text-red-500 text-sm mt-2">
                      Reward wajib diisi
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !reward.trim()}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-yellow-700 hover:to-orange-700 active:from-yellow-800 active:to-orange-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Mengklaim...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 mr-3" />
                      Klaim Reward
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}