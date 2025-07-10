import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  User, 
  Phone, 
  FileText, 
  Briefcase,
  Loader2,
  CheckCircle
} from 'lucide-react';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    organization_name: '',
    phone: '',
    address: '',
    gst_number: '',
    business_type: ''
  });
  const [loading, setLoading] = useState(false);
  const { createProfile } = useAuth();
  const { toast } = useToast();

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
    
    if (!formData.full_name || !formData.organization_name || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await createProfile(formData);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile created successfully! Redirecting to dashboard...",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to BizTrack Pro</h1>
          <p className="text-lg text-muted-foreground">
            Let's set up your business profile to get started
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Business Profile Setup
            </CardTitle>
            <CardDescription>
              This information will be used in your invoices and business records. You can change it later in your profile settings.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Business Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your complete business address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
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

              {/* Features Preview */}
              <div className="bg-card/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  What you'll get access to:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Customer Management</div>
                  <div>• Vendor Management</div>
                  <div>• Invoice Generation</div>
                  <div>• Payment Tracking</div>
                  <div>• Business Analytics</div>
                  <div>• Secure Data Storage</div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Complete Setup & Enter Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          * Required fields. You can update this information later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;