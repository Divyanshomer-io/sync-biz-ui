import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  Info,
  User,
  Linkedin,
  Mail,
  Shield,
  Target,
  Lock
} from 'lucide-react';

interface AppInfoProps {
  onBack: () => void;
}

const AppInfo: React.FC<AppInfoProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background pt-16 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">App Information</h1>
          <p className="text-lg text-muted-foreground">
            About BizTrack and its developer
          </p>
        </div>

        {/* Developer Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Developer Information
            </CardTitle>
            <CardDescription>
              Meet the creator behind BizTrack
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">Name:</span>
                <span>Divyanshu Lila</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-primary" />
                <span className="font-medium">LinkedIn:</span>
                <a 
                  href="https://www.linkedin.com/in/divyanshu-lila" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.linkedin.com/in/divyanshu-lila
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-medium">Email:</span>
                <a 
                  href="mailto:divyanshulila11@gmail.com"
                  className="text-primary hover:underline"
                >
                  divyanshulila11@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              About BizTrack
            </CardTitle>
            <CardDescription>
              Comprehensive business management solution
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What BizTrack Covers</h3>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• Customer Management & Relationship Tracking</li>
                  <li>• Vendor Management & Purchase Orders</li>
                  <li>• Sales Invoice Generation & Management</li>
                  <li>• Payment Tracking (Received & Made)</li>
                  <li>• Financial Analytics & Reporting</li>
                  <li>• GST Compliance & Tax Management</li>
                  <li>• Business Performance Metrics</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Why BizTrack Was Created</h3>
                <p className="text-muted-foreground">
                  BizTrack was developed to streamline business operations for small to medium enterprises. 
                  It addresses the common challenges businesses face in managing customers, vendors, sales, 
                  and financial tracking by providing an integrated, user-friendly platform that consolidates 
                  all essential business functions in one place.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Data Security & Privacy
            </CardTitle>
            <CardDescription>
              Your business data is our priority
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Enterprise-Grade Security</h4>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted using industry-standard protocols and stored securely in certified cloud infrastructure.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">User Privacy Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Your business data is isolated and accessible only to you. We follow strict privacy policies and never share your information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Regular Backups & Recovery</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated daily backups ensure your data is always safe and recoverable in case of any unforeseen circumstances.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Compliance Ready</h4>
                  <p className="text-sm text-muted-foreground">
                    Built with compliance in mind, supporting GST requirements and maintaining audit trails for all business transactions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppInfo;