import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const comingSoonRoutes = [
  '/some-coming-soon-page', // Add your coming soon routes here
  // Example: '/future-feature', '/new-service', etc.
];

const NotFound = () => {
  const location = useLocation();
  const isComingSoon = comingSoonRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin/dashboard") && !localStorage.getItem("isAdmin")) {
      window.location.href = "/";
    }
    console.error(
      isComingSoon ?
        "Coming Soon: User attempted to access a not-yet-available route:" :
        "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname, isComingSoon]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{isComingSoon ? 'Coming Soon' : '404'}</h1>
        <p className="text-xl text-gray-600 mb-4">
          {isComingSoon ?
            'This page is coming soon.' :
            'Oops! Page not found.'}
        </p>
        <div className="flex flex-col items-center gap-3 mb-4">
          <a href="/akr-sons-bike-store" className="text-emerald-700 hover:text-emerald-900 underline font-semibold">Try Book Vehicle</a>
          <a href="/akr-multi-complex/rooms" className="text-blue-700 hover:text-blue-900 underline font-semibold">Try Book Room</a>
        </div>
        <a href="/" className="inline-block mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 font-bold transition">Go Back Home</a>
      </div>
    </div>
  );
};

export default NotFound;
