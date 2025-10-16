import CirclePfpCard from "../../components/cards/circlepfpcard/CirclePfpCard";
import "./Home.css";

export default function Home() {
  const recentUsers = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Welcome back to CityCare!</p>
        </div>
        <div className="header-actions">
          <CirclePfpCard
            imageSrc={recentUsers}
            maxVisible={5}
            title="Recent Contributors"
          />
        </div>
      </div>
    </div>
  );
}
