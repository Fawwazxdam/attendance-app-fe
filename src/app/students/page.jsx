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
    user_id: "",
    fullname: "",
    grade_id: "",
    birth_date: "",
    address: "",
    phone_number: "",
    image: "",
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, usersRes, gradesRes] = await Promise.all([
        api.get("/students"),
        api.get("/users"),
        api.get("/grades"),
      ]);
      setStudents(studentsRes.data);
      setUsers(usersRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(
    "user : ",users, 
    "Grades : ",grades,
    "Student :", students
  )

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, {
          fullname: formData.fullname,
          phone_number: formData.phone_number,
          image: formData.image,
        });
      } else {
        await api.post("/students", formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        user_id: "",
        fullname: "",
        grade_id: "",
        birth_date: "",
        address: "",
        phone_number: "",
        image: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      user_id: student.user_id,
      fullname: student.fullname,
      grade_id: student.grade_id,
      birth_date: student.birth_date,
      address: student.address,
      phone_number: student.phone_number,
      image: student.image,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        await api.delete(`/students/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      user_id: "",
      fullname: "",
      grade_id: "",
      birth_date: "",
      address: "",
      phone_number: "",
      image: "",
    });
    setShowModal(true);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id == userId);
    return user ? user.name : "Unknown";
  };

  const getGradeName = (gradeId) => {
    const grade = grades.find((g) => g.id == gradeId);
    return grade ? grade.name : "Unknown";
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Manajemen Siswa
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola profil dan informasi siswa
                </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Siswa</span>
            </button>
          </div>

          <DataTable
            columns={[
              { header: "Nama Lengkap", key: "fullname" },
              {
                header: "Kelas",
                render: (student) => getGradeName(student.grade_id),
              },
              { header: "Nomor Telepon", key: "phone_number" },
              {
                header: "Poin",
                render: (student) => student.student_point?.total_points || 0,
              },
              { header: "Gambar", key: "image" },
            ]}
            data={students}
            actions={(student) => (
              <>
                <button
                  onClick={() => handleEdit(student)}
                  className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
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
            title={editingStudent ? "Edit Siswa" : "Tambah Siswa Baru"}
          >
            <form onSubmit={handleSubmit}>
              {!editingStudent && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Pengguna
                    </label>
                    <select
                      value={formData.user_id}
                      onChange={(e) =>
                        setFormData({ ...formData, user_id: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Pilih Pengguna</option>
                      {users
                        .filter((u) => !u.teacher && !u.student)
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Kelas
                    </label>
                    <select
                      value={formData.grade_id}
                      onChange={(e) =>
                        setFormData({ ...formData, grade_id: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gambar
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="path/to/image.jpg"
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
                  {editingStudent ? "Perbarui" : "Buat"}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
