"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/services/authService";
import api from "@/services/api";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [stimulusControlChecked, setStimulusControlChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === 'student') {
        if (!user.student?.self_contract && pathname !== '/self-contract') {
          router.push("/self-contract");
        } else if (user.student?.self_contract && pathname !== '/stimulus-control' && pathname !== '/self-contract') {
          // Check if student has stimulus control
          checkStimulusControl();
        } else {
          setStimulusControlChecked(true);
        }
      } else {
        setStimulusControlChecked(true);
      }
    }
  }, [user, isLoading, router, pathname]);

  const checkStimulusControl = async () => {
    try {
      const response = await api.get('/stimulus-controls');
      const controls = response.data.data;
      const userControl = controls.find(control => control.student_id === user.student.id);

      if (!userControl) {
        router.push("/stimulus-control");
      } else {
        setStimulusControlChecked(true);
      }
    } catch (error) {
      console.error("Error checking stimulus control:", error);
      // If error, allow access to avoid blocking
      setStimulusControlChecked(true);
    }
  };

  if (isLoading || (user?.role === 'student' && user?.student?.self_contract && !stimulusControlChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}