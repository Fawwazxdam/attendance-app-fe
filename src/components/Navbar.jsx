"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/services/authService";
import {
  LogOut,
  User,
  LayoutDashboard,
  UserCircle,
  ChevronDown,
  CheckCircle,
  Menu,
  X,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isPerlakuanDropdownOpen, setIsPerlakuanDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const perlakuanDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target)
      ) {
        setIsSettingsDropdownOpen(false);
      }
      if (
        perlakuanDropdownRef.current &&
        !perlakuanDropdownRef.current.contains(event.target)
      ) {
        setIsPerlakuanDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPerlakuanDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getAllowedNavigation = (role) => {
    const baseNav = [
      { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
      { name: "Absensi", href: "/attendance", icon: CheckCircle },
      {
        name: "Perlakuan",
        href: "#",
        icon: CheckCircle,
        dropdown: true,
        items: [
          { name: "Self Monitoring", href: "/self-monitoring", icon: CheckCircle },
          { name: "Self Contracting", href: "/self-contract", icon: CheckCircle },
          { name: "Stimulus Control", href: "/stimulus-control", icon: CheckCircle },
          { name: "Self Reward", href: "/reward", icon: CheckCircle },
        ],
      },
    ];

    if (role === "student") {
      return [
        ...baseNav,
        { name: "Aturan", href: "/reward-punishment-rules", icon: CheckCircle },
      ];
    }

    if (role === "teacher") {
      return [
        ...baseNav,
        { name: "Aturan", href: "/reward-punishment-rules", icon: CheckCircle },
        {
          name: "Pengaturan",
          href: "#",
          icon: Settings,
          dropdown: true,
          items: [
            { name: "Siswa", href: "/students", icon: User },
            { name: "Guru", href: "/teachers", icon: User },
            { name: "Kelas", href: "/grades", icon: User },
          ],
        },
      ];
    }

    if (role === "administrator") {
      return [
        ...baseNav,
        {
          name: "Pengaturan",
          href: "#",
          icon: Settings,
          dropdown: true,
          items: [
            { name: "Pengguna", href: "/users", icon: User },
            { name: "Siswa", href: "/students", icon: User },
            { name: "Guru", href: "/teachers", icon: User },
            { name: "Kelas", href: "/grades", icon: User },
          ],
        },
        {
          name: "Disiplin Siswa",
          href: "/student-discipline",
          icon: CheckCircle,
        },
        { name: "Aturan", href: "/reward-punishment-rules", icon: CheckCircle },
      ];
    }

    return baseNav; // fallback
  };

  const navigation = getAllowedNavigation(user?.role);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg border-b border-purple-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-blue-100 p-2 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
              <Link
                href="/dashboard"
                className="text-xl font-bold text-white hover:text-blue-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Attendance-App
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative" ref={dropdownRef}>
                  {/* User Dropdown */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-white hover:text-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                  >
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                      {user.name}
                    </span>
                    <UserCircle className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-10 border border-purple-200 backdrop-blur-sm">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-44 space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navbar */}
      {user && (
        <nav className="bg-gray-50 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start">
              <div className="hidden md:flex items-center space-x-1 pt-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  if (item.dropdown) {
                    const isOpen = item.name === "Perlakuan" ? isPerlakuanDropdownOpen : isSettingsDropdownOpen;
                    const setIsOpen = item.name === "Perlakuan" ? setIsPerlakuanDropdownOpen : setIsSettingsDropdownOpen;
                    const dropdownRef = item.name === "Perlakuan" ? perlakuanDropdownRef : settingsDropdownRef;
                    return (
                      <div
                        key={item.name}
                        className="relative"
                        ref={dropdownRef}
                      >
                        <button
                          onClick={() => {
                            if (item.name === "Perlakuan") {
                              setIsPerlakuanDropdownOpen(!isPerlakuanDropdownOpen);
                              setIsSettingsDropdownOpen(false);
                            } else {
                              setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
                              setIsPerlakuanDropdownOpen(false);
                            }
                          }}
                          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors pb-1 rounded-md ${
                            isActive
                              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {isOpen && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl py-2 z-10 border border-purple-200">
                            {item.items.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 rounded-lg mx-2 ${
                                    isSubActive
                                      ? "bg-purple-50 text-purple-700"
                                      : ""
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <SubIcon className="h-4 w-4" />
                                  <span>{subItem.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors pb-1 rounded-md ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    if (item.dropdown) {
                      const isOpen = item.name === "Perlakuan" ? isPerlakuanDropdownOpen : isSettingsDropdownOpen;
                      const setIsOpen = item.name === "Perlakuan" ? setIsPerlakuanDropdownOpen : setIsSettingsDropdownOpen;
                      return (
                        <div key={item.name}>
                          <button
                            onClick={() => {
                              if (item.name === "Perlakuan") {
                                setIsPerlakuanDropdownOpen(!isPerlakuanDropdownOpen);
                                setIsSettingsDropdownOpen(false);
                              } else {
                                setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
                                setIsPerlakuanDropdownOpen(false);
                              }
                            }}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left ${
                              isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                            <ChevronDown className="h-3 w-3 ml-auto" />
                          </button>
                          {isOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.items.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const isSubActive = pathname === subItem.href;
                                return (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                      isSubActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                  >
                                    <SubIcon className="h-4 w-4" />
                                    <span>{subItem.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  );
}