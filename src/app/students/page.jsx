"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/services/authService";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { Plus, Edit, Trash2 } from "lucide-react";
import api from "@/services/api";

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    nis: '',
    grade_id: '',
    birth_date: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, usersRes, gradesRes] = await Promise.all([
        api.get('/students'),
        api.get('/users'),
        api.get('/grades')
      ]);
      setStudents(studentsRes.data);
      setUsers(usersRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        // For update, assuming PUT /students/{id}
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ user_id: '', nis: '', grade_id: '', birth_date: '', address: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      user_id: student.user_id,
      nis: student.nis,
      grade_id: student.grade_id,
      birth_date: student.birth_date,
      address: student.address
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({ user_id: '', nis: '', grade_id: '', birth_date: '', address: '' });
    setShowModal(true);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id == userId);
    return user ? user.name : 'Unknown';
  };

  const getGradeName = (gradeId) => {
    const grade = grades.find(g => g.id == gradeId);
    return grade ? grade.name : 'Unknown';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>

        <DataTable
          columns={[
            { header: 'Name', render: (student) => getUserName(student.user_id) },
            { header: 'NIS', key: 'nis' },
            { header: 'Grade', render: (student) => getGradeName(student.grade_id) },
            { header: 'Birth Date', key: 'birth_date' },
            { header: 'Address', key: 'address' },
          ]}
          data={students}
          actions={(student) => (
            <>
              <button
                onClick={() => handleEdit(student)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(student.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
        >
          <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select User</option>
                      {users.filter(u => !u.teacher && !u.student).map((user) => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">NIS</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Grade</label>
                    <select
                      value={formData.grade_id}
                      onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingStudent ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
          </Modal>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}