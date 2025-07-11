import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AppInfo from './AppInfo';
import { 
  Building2, 
  User, 
  Phone, 
  FileText, 
  Briefcase,
  Loader2,
  Save,
  LogOut,
  ArrowLeft,
  Mail,
  Edit,
  Info
} from 'lucide-react';

interface UserProfileProps {
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    organization_name: profile?.organization_name || '',
    phone: profile?.phone || '',
    gst_number: profile?.gst_number || '',
    business_type: profile?.business_type || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        organization_name: profile.organization_name || '',
        phone: profile.phone || '',
        gst_number: profile.gst_number || '',
        business_type: profile.business_type || ''
      });
    }
  }, [profile]);

  const businessTypes = [
    'Retail',
    'Wholesale',
    'Manufacturing',
    'Services',
    'Consulting',
    'E-commerce',
    'Restaurant',
    'Healthcare',
    'Real Estate',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.organization_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile(formData);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form data to profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        organization_name: profile.organization_name || '',
        phone: profile.phone || '',
        gst_number: profile.gst_number || '',
        business_type: profile.business_type || ''
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleShowAppInfo = () => {
    setShowAppInfo(true);
  };

  const handleBackFromAppInfo = () => {
    setShowAppInfo(false);
  };

  if (showAppInfo) {
    return <AppInfo onBack={handleBackFromAppInfo} />;
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-lg text-muted-foreground">
            {isEditing ? 'Edit your business profile information' : 'Your business profile information'}
          </p>
        </div>

        {/* Profile Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Update your business profile information' : 'Your current business profile details'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isEditing ? (
              // Read-only view
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email (Read-only) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {user?.email || 'Not provided'}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Full Name
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {profile?.full_name || 'Not provided'}
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Organization Name
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {profile?.organization_name || 'Not provided'}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {profile?.phone || 'Not provided'}
                    </div>
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      GST Number
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {profile?.gst_number || 'Not provided'}
                    </div>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Business Type
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg text-foreground">
                      {profile?.business_type || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email (Read-only) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>

                  {/* Organization Name */}
                  <div className="space-y-2">
                    <Label htmlFor="organization_name" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Organization Name *
                    </Label>
                    <Input
                      id="organization_name"
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.organization_name}
                      onChange={(e) => handleInputChange('organization_name', e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2">
                    <Label htmlFor="gst_number" className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      GST Number
                    </Label>
                    <Input
                      id="gst_number"
                      type="text"
                      placeholder="Enter your GST number"
                      value={formData.gst_number}
                      onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    />
                  </div>

                  {/* Business Type */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="business_type" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Business Type
                    </Label>
                    <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* App Info Button */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Application Information
            </CardTitle>
            <CardDescription>
              Learn more about BizTrack and its developer
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={handleShowAppInfo}
              variant="outline"
              className="w-full"
            >
              <Info className="w-4 h-4 mr-2" />
              App Info
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-destructive">Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {!isEditing && (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;