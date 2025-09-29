export default function LoadingSpinner({ size = "h-32 w-32", className = "" }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${size}`}></div>
    </div>
  );
}