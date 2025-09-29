import { useAuth } from "@/services/authService";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data for demonstration - in real app, fetch from API
  const stats = [
    {
      title: "Total Students",
      value: "150",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Today's Attendance",
      value: "142",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Absent Today",
      value: "8",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Total Classes",
      value: "12",
      icon: Calendar,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with attendance today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Attendance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Class 10A</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Present
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                <p className="text-xs text-gray-500">Class 10B</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Late
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Bob Johnson</p>
                <p className="text-xs text-gray-500">Class 9A</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Absent
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                Mark Attendance
              </p>
              <p className="text-xs text-gray-500">
                Record today's attendance
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                View Reports
              </p>
              <p className="text-xs text-gray-500">
                Generate attendance reports
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                Manage Students
              </p>
              <p className="text-xs text-gray-500">
                Add or edit student information
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}