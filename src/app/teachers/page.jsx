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

export default function TeachersPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    fullname: '',
    phone_number: '',
    address: '',
    subject: '',
    hire_date: ''
  });

  if (user?.role !== 'administrator' && user?.role !== 'teacher') {
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
  const { data: teachersData, error: teachersError, mutate: mutateTeachers } = useSWR('/teachers', {
    onError: (error) => {
      toast.error('Gagal memuat data guru');
      console.error('Teachers error:', error);
    }
  });
  const { data: usersData, error: usersError, mutate: mutateUsers } = useSWR('/users', {
    onError: (error) => {
      toast.error('Gagal memuat data pengguna');
      console.error('Users error:', error);
    }
  });

  const teachers = teachersData || [];
  const users = usersData || [];
  const loading = !teachersData || !usersData;
  const error = teachersError || usersError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, {
          fullname: formData.fullname,
          phone_number: formData.phone_number,
          address: formData.address
        });
        toast.success("Guru berhasil diperbarui");
      } else {
        await api.post('/teachers', formData);
        toast.success("Guru berhasil ditambahkan");
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({ user_id: '', fullname: '', phone_number: '', address: '', subject: '', hire_date: '' });
      mutateTeachers();
      mutateUsers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error("Gagal menyimpan guru: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      user_id: teacher.user_id,
      fullname: teacher.fullname,
      phone_number: teacher.phone_number,
      address: teacher.address,
      subject: teacher.subject,
      hire_date: teacher.hire_date
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
      try {
        await api.delete(`/teachers/${id}`);
        toast.success("Guru berhasil dihapus");
        mutateTeachers();
        mutateUsers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error("Gagal menghapus guru: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({ user_id: '', fullname: '', phone_number: '', address: '', subject: '', hire_date: '' });
    setShowModal(true);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id == userId);
    return user ? user.name : 'Unknown';
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
              <Skeleton height={48} width={140} className="rounded-xl" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={120} />
                      <Skeleton height={40} width={150} />
                      <Skeleton height={40} width={100} />
                      <Skeleton height={40} width={100} />
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
            <h1 className="text-3xl font-bold text-green-600">Manajemen Guru</h1>
            <p className="text-gray-600 mt-1">Kelola profil dan informasi guru</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 active:bg-green-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Guru</span>
          </button>
        </div>

        <DataTable
          columns={[
            { header: 'Nama Lengkap', key: 'fullname' },
            { header: 'Nomor Telepon', key: 'phone_number' },
            { header: 'Alamat', key: 'address' },
            { header: 'Mata Pelajaran', key: 'subject' },
            { header: 'Tanggal Bergabung', key: 'hire_date' },
          ]}
          data={teachers}
          actions={(teacher) => (
            <>
              <button
                onClick={() => handleEdit(teacher)}
                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(teacher.id)}
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
          title={editingTeacher ? 'Edit Guru' : 'Tambah Guru Baru'}
        >
          <form onSubmit={handleSubmit}>
                {!editingTeacher && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Pengguna</label>
                      <select
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Pilih Pengguna</option>
                        {users.filter(u => !u.teacher && !u.student).map((user) => (
                          <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
                      <input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Alamat</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
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
                      {editingTeacher ? 'Perbarui' : 'Buat'}
                    </button>
                  </div>
                </form>
          </Modal>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}