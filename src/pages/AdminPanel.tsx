import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, Crown, Zap, Lock, HardDrive, Users, Loader2 } from "lucide-react";

const AdminPanel = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Premium feature toggles (local state for testing)
  const [features, setFeatures] = useState({
    unlimitedCompressions: false,
    allCompressionLevels: false,
    passwordProtection: false,
    largePackages: false,
    bulkOperations: false,
    prioritySupport: false,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin-login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enableAll = () => {
    setFeatures({
      unlimitedCompressions: true,
      allCompressionLevels: true,
      passwordProtection: true,
      largePackages: true,
      bulkOperations: true,
      prioritySupport: true,
    });
  };

  const disableAll = () => {
    setFeatures({
      unlimitedCompressions: false,
      allCompressionLevels: false,
      passwordProtection: false,
      largePackages: false,
      bulkOperations: false,
      prioritySupport: false,
    });
  };

  const featureList = [
    { key: "unlimitedCompressions" as const, label: "Unlimited Compressions", icon: Zap, description: "Remove the 5/month free tier limit" },
    { key: "allCompressionLevels" as const, label: "All Compression Levels", icon: HardDrive, description: "Access Max compression level" },
    { key: "passwordProtection" as const, label: "Password Protection", icon: Lock, description: "Add passwords to compressed files" },
    { key: "largePackages" as const, label: "2GB Package Size", icon: HardDrive, description: "Increase limit from 100MB to 2GB" },
    { key: "bulkOperations" as const, label: "Bulk Operations", icon: Users, description: "Send to multiple recipient groups" },
    { key: "prioritySupport" as const, label: "Priority Support", icon: Crown, description: "Priority email support queue" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Premium Feature Testing</CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Test Mode
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Toggle premium features on/off to test functionality before going live.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={enableAll}>
                Enable All
              </Button>
              <Button size="sm" variant="outline" onClick={disableAll}>
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {featureList.map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Switch
                    id={key}
                    checked={features[key]}
                    onCheckedChange={() => toggleFeature(key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Stats (placeholder) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Subscription Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Active Subscribers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$0</p>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Total Compressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
