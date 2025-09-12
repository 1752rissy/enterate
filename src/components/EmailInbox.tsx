import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types';
import { getSentEmails } from '@/lib/emailService';
import { 
  Mail, 
  MailOpen, 
  Clock, 
  CheckCircle,
  X,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface EmailInboxProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  status: string;
}

export default function EmailInbox({ currentUser, isOpen, onClose }: EmailInboxProps) {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [showEmailContent, setShowEmailContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen, currentUser.email]);

  const loadEmails = () => {
    const allEmails = getSentEmails();
    // Filter emails for current user
    const userEmails = allEmails.filter((email: EmailRecord) => 
      email.to === currentUser.email
    );
    setEmails(userEmails.reverse()); // Show newest first
  };

  const handleEmailClick = (email: EmailRecord) => {
    setSelectedEmail(email);
    setShowEmailContent(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getEmailIcon = (subject: string) => {
    if (subject.includes('aprobada')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (subject.includes('Actualización')) {
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
    return <Mail className="w-5 h-5 text-blue-600" />;
  };

  const getEmailBadge = (subject: string) => {
    if (subject.includes('aprobada')) {
      return <Badge className="bg-green-100 text-green-800">Aprobación</Badge>;
    } else if (subject.includes('Actualización')) {
      return <Badge className="bg-orange-100 text-orange-800">Actualización</Badge>;
    }
    return <Badge variant="secondary">Notificación</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Inbox className="w-5 h-5 text-blue-600" />
              <span>Bandeja de Entrada - {currentUser.name}</span>
              <Badge variant="outline">{emails.length} emails</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes emails
                </h3>
                <p className="text-gray-600">
                  Los emails de notificación aparecerán aquí cuando los recibas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <Card 
                    key={email.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleEmailClick(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getEmailIcon(email.subject)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {email.subject}
                              </h3>
                              {getEmailBadge(email.subject)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              De: Sistema Entérate &lt;noreply@enterate.com&gt;
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(email.sentAt)}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-green-600 border-green-200"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Entregado
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-blue-600 hover:text-blue-700"
                        >
                          <MailOpen className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Content Dialog */}
      <Dialog open={showEmailContent} onOpenChange={setShowEmailContent}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                {selectedEmail && getEmailIcon(selectedEmail.subject)}
                <span>{selectedEmail?.subject}</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailContent(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <p><strong>De:</strong> Sistema Entérate &lt;noreply@enterate.com&gt;</p>
                    <p><strong>Para:</strong> {selectedEmail.to}</p>
                    <p><strong>Fecha:</strong> {formatDate(selectedEmail.sentAt)}</p>
                  </div>
                  {getEmailBadge(selectedEmail.subject)}
                </div>
              </div>
              
              <div 
                className="prose max-w-none overflow-y-auto max-h-[60vh] border rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
              />
              
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Este es un email de demostración. En un entorno de producción, 
                  este email sería enviado a tu dirección de correo electrónico real.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}