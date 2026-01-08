"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle, Heart, HeartHandshake, Users, FileText } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SelfContractPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [contract, setContract] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contract.trim()) {
      toast.error("Self contract tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      await api.put(`/students/${user.student.id}`, {
        self_contract: contract.trim(),
      });

      // Update local user data
      user.student.self_contract = contract.trim();

      toast.success("Self contract berhasil disimpan!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving self contract:", error);
      toast.error("Gagal menyimpan self contract");
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

  // Check if user has already created a self contract
  const hasContract = user?.student?.self_contract && user.student.self_contract.trim() !== "";

  // Admin view
  if (user.role === 'administrator') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-purple-600 mb-3">
                  Manajemen Self Contract Siswa
                </h1>
                <p className="text-gray-600 text-lg">
                  Pantau status self contract semua siswa
                </p>
                <div className="w-24 h-1 bg-purple-500 rounded-full mx-auto mt-4"></div>
              </div>

              {loadingStudents ? (
                <LoadingSpinner />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-purple-600 p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Daftar Siswa dan Self Contract
                    </h2>
                    <p className="text-purple-100">
                      Status self contract semua siswa
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
                              Self Contract
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
                                {student.self_contract && student.self_contract.trim() !== "" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Sudah Dibuat
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Belum Dibuat
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {student.self_contract && student.self_contract.trim() !== "" ? (
                                  <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200 max-w-md">
                                    <div className="line-clamp-3">
                                      {student.self_contract}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 italic">
                                    Belum ada self contract
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                <HeartHandshake className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Self Contract
              </h1>
              {hasContract ? (
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ini adalah kontrak diri yang telah Anda buat. Ingatlah komitmen ini untuk tetap termotivasi!
                </p>
              ) : (
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sebelum mulai menggunakan aplikasi ini, tuliskan Kontrak diri Anda kepada diri sendiri.
                  Bagaimana Anda akan lebih disiplin dan lebih baik dengan bantuan aplikasi ini?
                </p>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Kontrak Diri Saya
                </h2>
                <p className="text-blue-100 mt-1">
                  {hasContract ? "Komitmen Anda untuk menjadi lebih baik" : "Tuliskan komitmen Anda untuk menjadi lebih baik"}
                </p>
              </div>

              {hasContract ? (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 text-lg leading-relaxed">
                      {user.student.self_contract}
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
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-6">
                    <textarea
                      value={contract}
                      onChange={(e) => setContract(e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 text-lg leading-relaxed"
                      rows={8}
                      required
                    />
                    {contract.trim() === "" && (
                      <p className="text-red-500 text-sm mt-2">
                        Kontrak diri wajib diisi
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !contract.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 mr-3" />
                        Simpan Kontrak Diri
                      </div>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Kontrak ini akan membantu Anda tetap termotivasi dan disiplin
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}