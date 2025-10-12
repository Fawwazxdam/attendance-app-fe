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

export default function GradesPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    homeroom_teacher_id: ''
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
  const { data: gradesData, error: gradesError, mutate: mutateGrades } = useSWR('/grades', {
    onError: (error) => {
      toast.error('Gagal memuat data kelas');
      console.error('Grades error:', error);
    }
  });
  const { data: teachersData, error: teachersError, mutate: mutateTeachers } = useSWR('/teachers', {
    onError: (error) => {
      toast.error('Gagal memuat data guru');
      console.error('Teachers error:', error);
    }
  });

  const grades = gradesData || [];
  const teachers = teachersData || [];
  const loading = !gradesData || !teachersData;
  const error = gradesError || teachersError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, formData);
        toast.success("Kelas berhasil diperbarui");
      } else {
        await api.post('/grades', formData);
        toast.success("Kelas berhasil ditambahkan");
      }
      setShowModal(false);
      setEditingGrade(null);
      setFormData({ name: '', homeroom_teacher_id: '' });
      mutateGrades();
      mutateTeachers();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error("Gagal menyimpan kelas: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      name: grade.name,
      homeroom_teacher_id: grade.homeroom_teacher_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        await api.delete(`/grades/${id}`);
        toast.success("Kelas berhasil dihapus");
        mutateGrades();
        mutateTeachers();
      } catch (error) {
        console.error('Error deleting grade:', error);
        toast.error("Gagal menghapus kelas: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const openCreateModal = () => {
    setEditingGrade(null);
    setFormData({ name: '', homeroom_teacher_id: '' });
    setShowModal(true);
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id == teacherId);
    return teacher ? teacher.fullname : 'Unknown';
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
                      <Skeleton height={40} width={150} />
                      <Skeleton height={40} width={200} />
                      <Skeleton height={40} width={80} />
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
              <h1 className="text-3xl font-bold text-indigo-600">Manajemen Kelas</h1>
              <p className="text-gray-600 mt-1">Kelola kelas dan guru wali kelas</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <DataTable
            columns={[
              { header: 'Nama', key: 'name' },
              { header: 'Guru Wali Kelas', render: (grade) => getTeacherName(grade.homeroom_teacher_id) },
              { header: 'Jumlah Siswa', render: (grade) => grade.students ? grade.students.length : 0 },
            ]}
            data={grades}
            actions={(grade) => (
              <>
                <button
                  onClick={() => handleEdit(grade)}
                  className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(grade.id)}
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
            title={editingGrade ? 'Edit Kelas' : 'Tambah Kelas Baru'}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Guru Wali Kelas</label>
                <select
                  value={formData.homeroom_teacher_id}
                  onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.fullname}</option>
                  ))}
                </select>
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
                  {editingGrade ? 'Perbarui' : 'Buat'}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}