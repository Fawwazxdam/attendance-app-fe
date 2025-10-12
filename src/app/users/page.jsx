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

export default function UsersPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  if (user?.role !== 'administrator') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Fetch data using SWR
  const { data: usersData, error: usersError, mutate: mutateUsers } = useSWR('/users', {
    onError: (error) => {
      toast.error('Gagal memuat data pengguna');
      console.error('Users error:', error);
    }
  });

  const users = usersData || [];
  const loading = !usersData;
  const error = usersError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name: formData.name,
          email: formData.email
        });
        toast.success("Pengguna berhasil diperbarui");
      } else {
        await api.post('/users', formData);
        toast.success("Pengguna berhasil ditambahkan");
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', username: '', email: '', password: '', role: 'student' });
      mutateUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error("Gagal menyimpan pengguna: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: '',
      password: '',
      role: 'student'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Pengguna berhasil dihapus");
        mutateUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Gagal menghapus pengguna: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', email: '', password: '', role: 'student' });
    setShowModal(true);
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
              <Skeleton height={48} width={160} className="rounded-xl" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={120} />
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={100} />
                      <Skeleton height={40} width={150} />
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
            <h1 className="text-3xl font-bold text-purple-600">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola pengguna sistem dan peran mereka</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 active:bg-purple-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Pengguna</span>
          </button>
        </div>

        <DataTable
          columns={[
            { header: 'Nama', key: 'name' },
            { header: 'Nama Pengguna', key: 'username' },
            { header: 'Email', key: 'email' },
            { header: 'Peran', key: 'role' },
            { header: 'Detail', render: (user) => user.teacher ? `Guru: ${user.teacher.fullname}` : user.student ? `Siswa: ${user.student.fullname}` : '' },
          ]}
          data={users}
          actions={(user) => (
            <>
              <button
                onClick={() => handleEdit(user)}
                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        >
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {!editingUser && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {!editingUser && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Peran</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
            </>
          )}
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
                {editingUser ? 'Perbarui' : 'Buat'}
              </button>
            </div>
          </form>
          </Modal>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}