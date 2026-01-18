import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoBackground from "@/components/CryptoBackground";
import SettingsContent from "@/components/dashboard/SettingsContent";
import WalletContent from "@/components/dashboard/WalletContent";
import TradeContent from "@/components/dashboard/TradeContent";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Wallet, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Play,
  Clock,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type TabType = "dashboard" | "learn" | "trade" | "wallet" | "settings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "learn" as TabType, label: "Learn", icon: BookOpen },
    { id: "trade" as TabType, label: "Trade", icon: TrendingUp },
    { id: "wallet" as TabType, label: "Wallet", icon: Wallet },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: "$67,234.50", change: "+2.34%", positive: true },
    { name: "Ethereum", symbol: "ETH", price: "$3,456.78", change: "+1.56%", positive: true },
    { name: "Solana", symbol: "SOL", price: "$178.90", change: "-0.89%", positive: false },
    { name: "Cardano", symbol: "ADA", price: "$0.62", change: "+3.21%", positive: true },
  ];

  const courses = [
    { title: "Crypto Basics 101", duration: "2h 30m", lessons: 12, progress: 75, rating: 4.8 },
    { title: "Technical Analysis", duration: "4h 15m", lessons: 18, progress: 30, rating: 4.9 },
    { title: "Risk Management", duration: "1h 50m", lessons: 8, progress: 100, rating: 4.6 },
    { title: "Open and Close", duration: "2h 15m", lessons: 10, progress: 0, rating: 4.8 },
    { title: "Ratio Trading", duration: "3h 30m", lessons: 14, progress: 0, rating: 4.9 },
    { title: "Pair Trading", duration: "4h 00m", lessons: 16, progress: 0, rating: 4.7 },
    { title: "Basket Trading", duration: "3h 45m", lessons: 12, progress: 0, rating: 4.8 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CryptoBackground />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card/40 backdrop-blur-xl border-r border-border/30 p-6 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-foreground">
              VOXTRADE
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  activeTab === item.id
                    ? "bg-primary/20 text-primary border border-primary/30 glow-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                {activeTab === "dashboard" && "Welcome back, Trader"}
                {activeTab === "learn" && "Learning Center"}
                {activeTab === "trade" && "Trade"}
                {activeTab === "wallet" && "Wallet"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === "dashboard" && "Here's what's happening with your portfolio"}
                {activeTab === "learn" && "Master crypto trading with expert courses"}
                {activeTab === "trade" && "Execute trades with precision"}
                {activeTab === "wallet" && "Manage your assets"}
                {activeTab === "settings" && "Customize your experience"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <WalletConnectButton />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-muted/30 border border-border/30 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <button className="relative p-2 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/50 transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'V'}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-1">Portfolio Value</p>
                  <p className="text-2xl font-display font-bold text-foreground">$124,567.89</p>
                  <p className="text-primary text-sm flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4" />
                    +12.34% this month
                  </p>
                </div>
                <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-1">24h Profit/Loss</p>
                  <p className="text-2xl font-display font-bold text-primary">+$2,345.67</p>
                  <p className="text-primary text-sm flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4" />
                    +1.89%
                  </p>
                </div>
                <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-1">Total Trades</p>
                  <p className="text-2xl font-display font-bold text-foreground">1,247</p>
                  <p className="text-muted-foreground text-sm mt-2">89% win rate</p>
                </div>
                <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                  <p className="text-muted-foreground text-sm mb-1">Learning Progress</p>
                  <p className="text-2xl font-display font-bold text-foreground">68%</p>
                  <p className="text-accent text-sm mt-2">4 courses in progress</p>
                </div>
              </div>

              {/* Market Overview */}
              <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-foreground">Market Overview</h2>
                  <button className="text-primary text-sm flex items-center gap-1 hover:underline">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {cryptoData.map((crypto) => (
                    <div key={crypto.symbol} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{crypto.name}</p>
                          <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{crypto.price}</p>
                        <p className={cn(
                          "text-sm flex items-center justify-end gap-1",
                          crypto.positive ? "text-primary" : "text-destructive"
                        )}>
                          {crypto.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {crypto.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Learn Content */}
          {activeTab === "learn" && (
            <div className="space-y-6">
              {/* Featured Course */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 bg-primary/30 text-primary text-sm rounded-full">Featured</span>
                    <h2 className="text-2xl font-display font-bold text-foreground mt-4 mb-2">
                      Master Crypto Trading in 30 Days
                    </h2>
                    <p className="text-muted-foreground mb-4 max-w-xl">
                      A comprehensive course covering everything from blockchain basics to advanced trading strategies. 
                      Learn to analyze markets, manage risk, and build a profitable portfolio.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 12 hours
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> 45 lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent" /> 4.9 rating
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors glow-primary">
                      <Play className="w-4 h-4" /> Start Learning
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-4">Your Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div key={course.title} className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {course.duration}
                        </span>
                        <span>{course.lessons} lessons</span>
                      </div>
                      {course.progress > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-primary">{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {course.progress === 0 && (
                        <button className="text-primary text-sm flex items-center gap-1 group-hover:underline">
                          Start Course <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Content */}
          {activeTab === "settings" && <SettingsContent />}

          {/* Wallet Content */}
          {activeTab === "wallet" && <WalletContent />}

          {/* Trade Content */}
          {activeTab === "trade" && <TradeContent />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
