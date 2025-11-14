import { useAuth } from "@/services/authService";
import { Users, Calendar, CheckCircle, Clock, TrendingUp, Award, AlertTriangle } from "lucide-react";
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
   const { user } = useAuth();
   const router = useRouter();

  // Fetch dashboard stats
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/dashboard/stats', {
    refreshInterval: 30000, // Refresh every 30 seconds
    onError: (error) => {
      toast.error('Gagal memuat data dashboard');
      console.error('Dashboard stats error:', error);
    }
  });

  // Fetch role-specific data
  const dashboardEndpoint = user?.role === 'student' ? `/dashboard/student/${user.student?.id || user.id}` :
                            user?.role === 'teacher' ? `/dashboard/teacher/${user.teacher?.id || user.id}` :
                            user?.role === 'administrator' ? '/dashboard/admin' : null;

  const { data: roleData, error: roleError, isLoading: roleLoading } = useSWR(
    dashboardEndpoint,
    {
      refreshInterval: 60000, // Refresh every minute for role data
      onError: (error) => {
        toast.error('Gagal memuat data dashboard role');
        console.error('Role dashboard error:', error);
      }
    }
  );

  // Fetch chart data
  const { data: trendData, error: trendError } = useSWR('/charts/attendance-trend?period=month&limit=6');
  const { data: classData, error: classError } = useSWR('/charts/class-performance');

  // Fetch student attendance chart data (only for students)
  const { data: studentChartData, error: studentChartError } = useSWR(
    user?.role === 'student' && (user?.student?.id || user?.id) ? `/charts/student-attendance/${user.student?.id || user.id}?period=day&limit=7` : null,
    {
      onError: (error) => {
        console.error('Student chart error:', error);
      }
    }
  );
  console.log("STATS DATA:", statsData);
  console.log("ROLE DATA:", roleData);

  // Prepare stats for display
  const stats = statsData?.success ? [
    {
      title: "Total Siswa",
      value: statsData.data.total_students.toString(),
      icon: Users,
      color: "bg-blue-500",
      change: "+2.5%",
      changeType: "positive"
    },
    {
      title: "Absensi Hari Ini",
      value: statsData.data.today_attendance.present.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
      subtitle: `${statsData.data.today_attendance.rate}% kehadiran`,
      change: `+${statsData.data.today_attendance.present - statsData.data.today_attendance.late}`,
      changeType: "positive"
    },
    {
      title: "Tidak Hadir Hari Ini",
      value: statsData.data.today_attendance.absent.toString(),
      icon: AlertTriangle,
      color: "bg-red-500",
      subtitle: `${((statsData.data.today_attendance.absent / statsData.data.total_students) * 100).toFixed(1)}% absen`,
      change: statsData.data.today_attendance.absent > 0 ? `-${statsData.data.today_attendance.absent}` : "0",
      changeType: "negative"
    },
    // {
    //   title: "Total Kelas",
    //   value: statsData.data.total_classes.toString(),
    //   icon: Calendar,
    //   color: "bg-purple-500",
    //   change: "Aktif",
    //   changeType: "neutral"
    // },
  ] : [];

  // Loading state
  if (statsLoading || roleLoading) {
    return (
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(120px,auto)]">
          {/* Welcome Skeleton */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Skeleton height={120} className="rounded-2xl" />
          </div>

          {/* Stats Skeletons */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${i < 2 ? 'col-span-1 md:col-span-2 lg:col-span-2' : 'col-span-1'} ${i === 0 ? 'row-span-1' : ''}`}
            >
              <Skeleton height={120} className="rounded-2xl" />
            </motion.div>
          ))}

          {/* Content Skeletons */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
            <Skeleton height={300} className="rounded-2xl" />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
            <Skeleton height={300} className="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || roleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">Gagal memuat data dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(120px,auto)]">

        {/* Welcome Card - Full Width */}
        <motion.div
          className="col-span-1 md:col-span-2 lg:col-span-4 bg-blue-600 rounded-2xl p-8 text-white shadow-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            Selamat datang kembali, {user?.name}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Berikut adalah ringkasan absensi hari ini
          </p>
          {roleData?.success && user?.role === 'student' && (
            <div className="mt-4 flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm">Streak Kehadiran</p>
                <p className="text-2xl font-bold">{roleData.data.personal_stats.current_streak} hari</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm">Total Poin</p>
                <p className="text-2xl font-bold">{roleData.data.personal_stats.total_points}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className={`${
              index === 0 ? 'col-span-1 md:col-span-2 lg:col-span-2' :
              index === 3 ? 'col-span-1 md:col-span-2 lg:col-span-2' :
              'col-span-1'
            } bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                {stat.subtitle && <p className="text-xs text-gray-500 mb-2">{stat.subtitle}</p>}
                {stat.change && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                    stat.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div className={`${stat.color} p-4 rounded-xl ml-4`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Charts Section - Only for Teachers and Admins */}
        {(user?.role === 'teacher' || user?.role === 'administrator') && trendData?.success && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              Trend Kehadiran 6 Bulan Terakhir
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.data.datasets[0].data.map((value, index) => ({
                  month: trendData.data.labels[index],
                  hadir: value,
                  terlambat: trendData.data.datasets[1].data[index],
                  tidakHadir: trendData.data.datasets[2].data[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={2} name="Hadir" />
                  <Line type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={2} name="Terlambat" />
                  <Line type="monotone" dataKey="tidakHadir" stroke="#EF4444" strokeWidth={2} name="Tidak Hadir" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Class Performance Chart - Only for Teachers and Admins */}
        {(user?.role === 'teacher' || user?.role === 'administrator') && classData?.success && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-purple-600 mr-2" />
              Performa Kelas Bulan Ini
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData.data.datasets[0].data.map((value, index) => ({
                  kelas: classData.data.labels[index],
                  persentase: value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kelas" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Kehadiran']} />
                  <Bar dataKey="persentase" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Student Attendance Chart */}
        {user?.role === 'student' && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              Trend Kehadiran 7 Hari Terakhir
            </h3>
            <div className="mb-4 text-center">
                  {(() => {
                    const totalPoints = roleData?.data?.personal_stats?.total_points || 0;
                    if (totalPoints >= 15) {
                      return (
                        <p className="text-green-600 font-medium">
                          🌿 Hebat! Disiplinmu keren banget, pertahankan ya! 💪
                        </p>
                      );
                    } else if (totalPoints >= 5) {
                      return (
                        <p className="text-blue-600 font-medium">
                          🎗️ Mantap! Udah bagus, tinggal lebih konsisten aja 😊
                        </p>
                      );
                    } else if (totalPoints <= -10) {
                      return (
                        <p className="text-red-600 font-medium">
                          🚨 Semangat! Yuk perbaiki besok biar makin disiplin 💪
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-gray-600 font-medium">
                          📈 Tetap semangat! Setiap hari adalah kesempatan untuk menjadi lebih baik.
                        </p>
                      );
                    }
                  })()}
            </div>
            {studentChartData?.success ? (
              <div className="h-64 text-black">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentChartData.data.datasets[0].data.map((value, index) => ({
                      hari: studentChartData.data.labels[index],
                      hadir: value,
                      terlambat: studentChartData.data.datasets[1].data[index],
                      tidakHadir: studentChartData.data.datasets[2].data[index],
                      presentTimes: studentChartData.data.datasets[0].data[index]?.present_times || [],
                      lateTimes: studentChartData.data.datasets[0].data[index]?.late_times || []
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hari" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === 'Hadir' && props.payload.presentTimes?.length > 0) {
                            return [`${value} (${props.payload.presentTimes.join(', ')})`, name];
                          }
                          if (name === 'Terlambat' && props.payload.lateTimes?.length > 0) {
                            return [`${value} (${props.payload.lateTimes.join(', ')})`, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={2} name="Hadir" />
                      <Line type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={2} name="Terlambat" />
                      <Line type="monotone" dataKey="tidakHadir" stroke="#EF4444" strokeWidth={2} name="Tidak Hadir" />
                    </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Memuat data grafik...</p>
                  {studentChartError && (
                    <p className="text-sm text-red-500 mt-1">Error: {studentChartError.message}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Role-specific content */}
        {user?.role === 'student' && roleData?.success && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-yellow-600 mr-2" />
              Riwayat Absensi Terbaru
            </h3>
            <div className="space-y-3">
              {roleData.data.recent_attendance.slice(0, 5).map((record, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.status === 'present' ? 'bg-green-100' :
                      record.status === 'late' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {record.status === 'present' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                       record.status === 'late' ? <Clock className="h-5 w-5 text-yellow-600" /> :
                       <AlertTriangle className="h-5 w-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{record.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status === 'present' ? 'Hadir' :
                       record.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">+{record.points} poin</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Teacher-specific content */}
        {user?.role === 'teacher' && roleData?.success && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Status Kelas Hari Ini
            </h3>
            <div className="space-y-3">
              {roleData.data.classes_today.map((classData, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{classData.class_name}</h4>
                    <span className="text-sm font-medium text-blue-600">{classData.rate}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">{classData.present}</p>
                      <p className="text-gray-500">Hadir</p>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-600 font-semibold">{classData.late}</p>
                      <p className="text-gray-500">Terlambat</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-semibold">{classData.absent}</p>
                      <p className="text-gray-500">Tidak Hadir</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Admin-specific content */}
        {user?.role === 'administrator' && roleData?.success && (
          <motion.div
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Aktivitas Sistem Terbaru
            </h3>
            <div className="space-y-3">
              {roleData.data.recent_activity.slice(0, 6).map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'present' ? 'bg-green-100' :
                      activity.status === 'late' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {activity.status === 'present' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                       activity.status === 'late' ? <Clock className="h-5 w-5 text-yellow-600" /> :
                       <AlertTriangle className="h-5 w-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.student_name}</p>
                      <p className="text-xs text-gray-500">{activity.grade} • {activity.time}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'present' ? 'bg-green-100 text-green-800' :
                    activity.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status === 'present' ? 'Hadir' :
                     activity.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions - Always visible */}
        <motion.div
          className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 row-span-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            Aksi Cepat
          </h3>
          <div className="space-y-3">
            <motion.button
              onClick={() => router.push('/attendance')}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Tandai Absensi</p>
                  <p className="text-xs text-gray-500">Catat absensi hari ini</p>
                </div>
              </div>
            </motion.button>

            {(user?.role === 'teacher' || user?.role === 'administrator') && (
              <motion.button
                onClick={() => router.push('/report')}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-600 transition-colors">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Lihat Laporan</p>
                    <p className="text-xs text-gray-500">Buat laporan absensi</p>
                  </div>
                </div>
              </motion.button>
            )}

            {(user?.role === 'teacher' || user?.role === 'administrator') && (
              <motion.button
                onClick={() => router.push('/students')}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg group-hover:bg-purple-600 transition-colors">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Kelola Siswa</p>
                    <p className="text-xs text-gray-500">Tambah atau edit informasi siswa</p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}