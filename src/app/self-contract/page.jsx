"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle, Heart, HeartHandshake } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SelfContractPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);

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
              <p className="text-lg text-gray-600 leading-relaxed">
                Sebelum mulai menggunakan aplikasi ini, tuliskan Kontrak diri Anda kepada diri sendiri.
                Bagaimana Anda akan lebih disiplin dan lebih baik dengan bantuan aplikasi ini?
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Kontrak Diri Saya
                </h2>
                <p className="text-blue-100 mt-1">
                  Tuliskan komitmen Anda untuk menjadi lebih baik
                </p>
              </div>

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