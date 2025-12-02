import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI, gamificationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function Sidebar({ isOpen, toggleSidebar, theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, fetchUser } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [userData, setUserData] = useState({
    username: "",
    totalPoints: 0,
    profileImage: "https://via.placeholder.com/40",
    firstName: "",
    lastName: "",
  });
  const [gamificationStats, setGamificationStats] = useState({
    totalPoints: 0,
    rank: { name: "Bronze", icon: "🥉", color: "#CD7F32" },
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        // Fetch user data and gamification stats in parallel
        const [userResponse, statsResponse] = await Promise.all([
          authAPI.getUser(),
          gamificationAPI.getStats().catch(() => ({ data: { totalPoints: 0, rank: { name: "Bronze", icon: "🥉", color: "#CD7F32" }, badges: [] } })),
        ]);
        
        if (userResponse.data.success && userResponse.data.user) {
          const user = userResponse.data.user;
          const profileImageUrl = user.profileImage?.startsWith("http")
            ? user.profileImage
            : user.profileImage?.startsWith("/")
            ? `http://localhost:5000${user.profileImage}`
            : "https://via.placeholder.com/40";

          setUserData({
            username: user.username || "Guest",
            totalPoints: statsResponse.data.totalPoints || 0,
            profileImage: profileImageUrl,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });

          // Set gamification stats
          if (statsResponse.data) {
            setGamificationStats({
              totalPoints: statsResponse.data.totalPoints || 0,
              rank: statsResponse.data.rank || { name: "Bronze", icon: "🥉", color: "#CD7F32" },
              badges: statsResponse.data.badges || [],
            });
          }
        } else {
          throw new Error(userResponse.data.error || "Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.error || err.message || "Error loading profile");
        setUserData({
          username: "Guest",
          totalPoints: 0,
          profileImage: "https://via.placeholder.com/40",
          firstName: "",
          lastName: "",
        });
        setGamificationStats({
          totalPoints: 0,
          rank: { name: "Bronze", icon: "🥉", color: "#CD7F32" },
          badges: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Refresh gamification stats every 30 seconds
    const interval = setInterval(() => {
      gamificationAPI.getStats()
        .then((response) => {
          if (response.data) {
            setGamificationStats({
              totalPoints: response.data.totalPoints || 0,
              rank: response.data.rank || { name: "Bronze", icon: "🥉", color: "#CD7F32" },
              badges: response.data.badges || [],
            });
            setUserData((prev) => ({
              ...prev,
              totalPoints: response.data.totalPoints || 0,
            }));
          }
        })
        .catch((err) => console.error("Error refreshing gamification stats:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, [authUser]); // Re-fetch when auth user changes

  useEffect(() => {
    const path = location.pathname;
    const pageMap = {
      "/dashboard": "Dashboard",
      "/tasks-goals": "Tasks & Goals",
      "/budget-tracker": "Budget Tracker",
      "/calendar": "Calendar",
      "/habits": "Habits",
      "/journal": "Journal",
      "/social-circle": "Social Circle",
      "/documents": "Documents",
      "/quick-tools": "Quick Tools",
      "/community-hub": "Community Hub",
      "/wellness": "Wellness",
      "/assistant": "Assistant",
      "/gamification": "Gamification",
      "/health-wellness": "Health & Wellness",
      "/notifications": "Notifications",
      "/profile": "Profile",
      "/settings": "Settings",
    };
    setActivePage(pageMap[path] || "Dashboard");
  }, [location]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Tasks & Goals", path: "/tasks-goals" },
    { name: "Budget Tracker", path: "/budget-tracker" },
    { name: "Calendar", path: "/calendar" },
    { name: "Habits", path: "/habits" },
    { name: "Journal", path: "/journal" },
    { name: "Social Circle", path: "/social-circle" },
    { name: "Documents", path: "/documents" },
    { name: "Quick Tools", path: "/quick-tools" },
    { name: "Community Hub", path: "/community-hub" },
    { name: "Wellness", path: "/wellness" },
    { name: "Assistant", path: "/assistant" },
    { name: "Gamification", path: "/gamification" },
    { name: "Health & Wellness", path: "/health-wellness" },
    { name: "Notifications", path: "/notifications" },
    { name: "Profile", path: "/profile" },
    { name: "Settings", path: "/settings" },
  ];

  const handleNavClick = (page, path) => {
    setActivePage(page);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-sidebar-bg border-r border-sidebar-border shadow-lg
      p-4 transition-transform duration-300 ease-in-out z-50 custom-scrollbar
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Profile Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {userData.profileImage && userData.profileImage !== "https://via.placeholder.com/40" ? (
            <img
              src={userData.profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-border"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-text font-semibold text-lg border border-border ${
              userData.profileImage && userData.profileImage !== "https://via.placeholder.com/40" ? 'hidden' : ''
            }`}
          >
            {userData.firstName ? (
              userData.firstName.charAt(0).toUpperCase()
            ) : userData.username ? (
              userData.username.charAt(0).toUpperCase()
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-sidebar-text truncate">
              {loading ? (
                "Loading..."
              ) : userData.firstName ? (
                `Hi, ${userData.firstName}`
              ) : (
                `Hi, ${userData.username}`
              )}
            </h2>
            {/* Points and Rank Display */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
                <span className="text-xs font-semibold text-primary">
                  {loading ? "..." : `${gamificationStats.totalPoints || 0} pts`}
                </span>
              </div>
              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${gamificationStats.rank.color}20` }}
                title={`Rank: ${gamificationStats.rank.name}`}
              >
                <span className="text-sm">{gamificationStats.rank.icon}</span>
                <span className="text-xs font-semibold" style={{ color: gamificationStats.rank.color }}>
                  {gamificationStats.rank.name}
                </span>
              </div>
            </div>
            {/* Recent Badges */}
            {gamificationStats.badges && gamificationStats.badges.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {gamificationStats.badges.slice(0, 3).map((badge, idx) => (
                  <span 
                    key={badge.id || idx} 
                    className="text-lg" 
                    title={badge.name}
                  >
                    {badge.icon}
                  </span>
                ))}
                {gamificationStats.badges.length > 3 && (
                  <span className="text-xs text-sidebar-text-muted">
                    +{gamificationStats.badges.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <button onClick={toggleSidebar} className="text-sidebar-text-muted hover:text-sidebar-text transition-colors flex-shrink-0">
          ✖
        </button>
      </div>

      {error && (
        <p className="text-error text-sm mb-4">
          {error.includes("token")
            ? "Please log in to see your profile."
            : "Error loading profile."}
        </p>
      )}

      {/* Nav Items */}
      <nav className="overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar">
        {navItems.map((item) => (
          <div
            key={item.name}
            onClick={() => handleNavClick(item.name, item.path)}
            className={`flex items-center space-x-2 p-2 rounded-lg mb-2 cursor-pointer 
              transition-colors duration-200
              ${
                activePage === item.name
                  ? "bg-sidebar-active text-primary font-medium"
                  : "hover:bg-sidebar-hover text-sidebar-text"
              }`}
          >
            <span>{item.name}</span>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 w-[calc(100%-2rem)]">
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-error text-error-text rounded-lg hover:bg-error-hover transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
