"use client";

import { useState } from "react";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { Plus, Edit, Trash2 } from "lucide-react";
import useSWR from 'swr';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '@/services/api';

export default function RewardPunishmentRulesPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    points: '',
    description: ''
  });

  const canManage = user?.role === 'administrator' || user?.role === 'teacher';

  // Fetch data using SWR
  const { data: rulesData, error: rulesError, mutate: mutateRules } = useSWR('/reward-punishment-rules', {
    onError: (error) => {
      toast.error('Gagal memuat data aturan hadiah & hukuman');
      console.error('Rules error:', error);
    }
  });

  const rules = rulesData || [];
  const loading = !rulesData;
  const error = rulesError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/reward-punishment-rules/${editingRule.id}`, formData);
        toast.success("Aturan berhasil diperbarui");
      } else {
        await api.post('/reward-punishment-rules', formData);
        toast.success("Aturan berhasil ditambahkan");
      }
      setShowModal(false);
      setEditingRule(null);
      setFormData({ type: '', name: '', points: '', description: '' });
      mutateRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error("Gagal menyimpan aturan: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      type: rule.type,
      name: rule.name,
      points: rule.points,
      description: rule.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
      try {
        await api.delete(`/reward-punishment-rules/${id}`);
        toast.success("Aturan berhasil dihapus");
        mutateRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
        toast.error("Gagal menghapus aturan: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setFormData({ type: '', name: '', points: '', description: '' });
    setShowModal(true);
  };

  const getTypeBadge = (type) => {
    return type === 'reward' ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Hadiah
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Hukuman
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <div>
                <Skeleton height={36} width={300} />
                <Skeleton height={20} width={250} className="mt-2" />
              </div>
              <Skeleton height={48} width={160} className="rounded-xl" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton height={32} width={80} className="rounded-full" />
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={60} />
                      <Skeleton height={40} width={250} />
                      <div className="flex space-x-2">
                        <Skeleton height={32} width={32} className="rounded-lg" />
                        <Skeleton height={32} width={32} className="rounded-lg" />
                      </div>
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
              <h1 className="text-3xl font-bold text-orange-600">Aturan Hadiah & Hukuman</h1>
              <p className="text-gray-600 mt-1">
                {canManage ? 'Kelola aturan hadiah dan hukuman untuk siswa' : 'Lihat aturan hadiah dan hukuman'}
              </p>
            </div>
            {canManage && (
              <button
                onClick={openCreateModal}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 active:bg-orange-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Tambah Aturan</span>
              </button>
            )}
          </div>

          <DataTable
            columns={[
              { header: 'Tipe', render: (rule) => getTypeBadge(rule.type) },
              { header: 'Nama', key: 'name' },
              { header: 'Poin', key: 'points' },
              { header: 'Deskripsi', key: 'description' },
            ]}
            data={rules}
            actions={canManage ? (rule) => (
              <>
                <button
                  onClick={() => handleEdit(rule)}
                  className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : null}
          />

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingRule ? 'Edit Aturan' : 'Tambah Aturan Baru'}
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="reward">Hadiah</option>
                  <option value="punishment">Hukuman</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Poin</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 active:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 active:bg-blue-800 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {editingRule ? 'Perbarui' : 'Buat'}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}