import { useState } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  CreditCard,
  Key,
  Smartphone,
  Mail,
  Camera,
  ChevronRight,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type SettingsSection = "profile" | "security" | "notifications" | "preferences" | "billing";

const SettingsContent = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    trades: true,
    priceAlerts: true,
    news: false,
    marketing: false,
  });
  const [preferences, setPreferences] = useState({
    darkMode: true,
    compactView: false,
    showBalance: true,
    currency: "USD",
    language: "English",
  });

  const sections = [
    { id: "profile" as SettingsSection, label: "Profile", icon: User },
    { id: "security" as SettingsSection, label: "Security", icon: Shield },
    { id: "notifications" as SettingsSection, label: "Notifications", icon: Bell },
    { id: "preferences" as SettingsSection, label: "Preferences", icon: Palette },
    { id: "billing" as SettingsSection, label: "Billing", icon: CreditCard },
  ];

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex gap-6">
      {/* Settings Navigation */}
      <div className="w-64 shrink-0">
        <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                  activeSection === section.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Profile Information</h3>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
                    V
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold mb-1">Profile Photo</h4>
                  <p className="text-muted-foreground text-sm">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue="Vox"
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Trader"
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="trader@voxtrade.com"
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="Passionate crypto trader and blockchain enthusiast."
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <div className="space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Security Settings</h3>
              
              {/* Password */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Change Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-primary">Enabled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email Verification</p>
                      <p className="text-sm text-primary">Verified</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Chrome on MacOS</p>
                      <p className="text-sm text-muted-foreground">San Francisco, US • Current session</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Voxtrade App on iPhone</p>
                      <p className="text-sm text-muted-foreground">San Francisco, US • 2 days ago</p>
                    </div>
                  </div>
                  <button className="text-destructive text-sm hover:underline">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Trade Confirmations</p>
                    <p className="text-sm text-muted-foreground">Get notified when trades are executed</p>
                  </div>
                  <Switch
                    checked={notifications.trades}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, trades: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Price Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify when prices hit your targets</p>
                  </div>
                  <Switch
                    checked={notifications.priceAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Market News</p>
                    <p className="text-sm text-muted-foreground">Daily market updates and news</p>
                  </div>
                  <Switch
                    checked={notifications.news}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, news: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Promotions, tips, and product updates</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Preferences Section */}
        {activeSection === "preferences" && (
          <div className="space-y-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Display Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme across the app</p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Compact View</p>
                    <p className="text-sm text-muted-foreground">Show more data in less space</p>
                  </div>
                  <Switch
                    checked={preferences.compactView}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, compactView: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Show Balance</p>
                    <p className="text-sm text-muted-foreground">Display balance on dashboard</p>
                  </div>
                  <Switch
                    checked={preferences.showBalance}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, showBalance: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Regional Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-4 py-3 bg-muted/30 border border-border/30 rounded-xl text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Billing Section */}
        {activeSection === "billing" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 bg-primary/30 text-primary text-sm rounded-full">Current Plan</span>
                  <h3 className="text-2xl font-display font-bold text-foreground mt-3">Pro Trader</h3>
                  <p className="text-muted-foreground mt-1">$29.99/month • Renews on Jan 15, 2025</p>
                </div>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Payment Method</h3>
              
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                  </div>
                </div>
                <button className="text-primary text-sm hover:underline">Edit</button>
              </div>

              <button className="text-primary text-sm flex items-center gap-1 hover:underline">
                + Add Payment Method
              </button>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-foreground mb-6">Billing History</h3>
              
              <div className="space-y-3">
                {[
                  { date: "Dec 15, 2024", amount: "$29.99", status: "Paid" },
                  { date: "Nov 15, 2024", amount: "$29.99", status: "Paid" },
                  { date: "Oct 15, 2024", amount: "$29.99", status: "Paid" },
                ].map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">Pro Trader - Monthly</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-foreground">{invoice.amount}</span>
                      <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">{invoice.status}</span>
                      <button className="text-primary text-sm hover:underline">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsContent;
