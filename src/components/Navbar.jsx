import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, gamificationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function Navbar({ toggleSidebar, toggleTheme, theme, isSidebarOpen }) {
  const { user: authUser, logout: authLogout } = useAuth();
  const [gamificationStats, setGamificationStats] = useState({
    totalPoints: 0,
    rank: { name: "Bronze", icon: "🥉", color: "#CD7F32" },
    badges: [],
  });
  const [userData, setUserData] = useState({
    username: "Guest",
    profileImage: "https://via.placeholder.com/40",
    firstName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserData({
          username: "Guest",
          profileImage: "https://via.placeholder.com/40",
          firstName: "",
        });
        setGamificationStats({
          totalPoints: 0,
          rank: { name: "Bronze", icon: "🥉", color: "#CD7F32" },
          badges: [],
        });
        setLoading(false);
        return;
      }

      try {
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
            profileImage: profileImageUrl,
            firstName: user.firstName || "",
          });

          // Set gamification stats
          if (statsResponse.data) {
            setGamificationStats({
              totalPoints: statsResponse.data.totalPoints || 0,
              rank: statsResponse.data.rank || { name: "Bronze", icon: "🥉", color: "#CD7F32" },
              badges: statsResponse.data.badges || [],
            });
          }

          setError("");
        } else {
          throw new Error(userResponse.data.error || "Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          setError("Session expired, please log in again");
          authLogout();
          navigate("/");
        } else {
          setError(err.response?.data?.error || err.message || "Error loading profile");
        }
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
          }
        })
        .catch((err) => console.error("Error refreshing gamification stats:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, [authUser, navigate, authLogout]);

  const handleLogout = () => {
    authLogout();
    navigate("/");
  };

  return (
    <nav className="bg-header-bg border-b border-header-border px-6 py-3 flex justify-between items-center shadow-sm">
      {/* Left side: Logo + Sidebar toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <svg
            className="w-6 h-6 text-header-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-header-text">LifeHub</h1>
      </div>

      {/* Right side: Points, Rank, Badges, Theme toggle, Profile */}
      <div className="flex items-center gap-3">
        {/* Gamification Display */}
        <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-full border border-border">
          {/* Points */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-primary">
              {gamificationStats.totalPoints || 0}
            </span>
            <span className="text-xs text-text-muted">pts</span>
          </div>
          
          {/* Divider */}
          <div className="w-px h-4 bg-border"></div>
          
          {/* Rank */}
          <div 
            className="flex items-center gap-1 cursor-pointer"
            title={`Rank: ${gamificationStats.rank.name}`}
          >
            <span className="text-base">{gamificationStats.rank.icon}</span>
            <span 
              className="text-xs font-semibold"
              style={{ color: gamificationStats.rank.color }}
            >
              {gamificationStats.rank.name}
            </span>
          </div>

          {/* Recent Badges */}
          {gamificationStats.badges && gamificationStats.badges.length > 0 && (
            <>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1">
                {gamificationStats.badges.slice(0, 2).map((badge, idx) => (
                  <span 
                    key={badge.id || idx} 
                    className="text-base cursor-pointer" 
                    title={badge.name}
                  >
                    {badge.icon}
                  </span>
                ))}
                {gamificationStats.badges.length > 2 && (
                  <span className="text-xs text-text-muted" title={`${gamificationStats.badges.length - 2} more badges`}>
                    +{gamificationStats.badges.length - 2}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          {theme === "dark" ? (
            <svg
              className="w-6 h-6 text-header-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 
                6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 
                0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 
                11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-header-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 
                018.646 3.646 9.003 9.003 0 0012 
                21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Profile with dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer">
            {userData.profileImage && userData.profileImage !== "https://via.placeholder.com/40" ? (
              <img
                src={userData.profileImage}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border border-border"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-text font-semibold text-sm border border-border ${
                userData.profileImage && userData.profileImage !== "https://via.placeholder.com/40" ? 'hidden' : ''
              }`}
            >
              {userData.firstName ? (
                userData.firstName.charAt(0).toUpperCase()
              ) : userData.username && userData.username !== "Guest" ? (
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
            <span className="font-medium text-header-text">
              {loading ? "Loading..." : userData.firstName || userData.username}
            </span>
          </div>
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-36 bg-surface-elevated border border-border rounded-lg shadow-lg hidden group-hover:block z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-surface-hover rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
