
import { useState } from "react";
import { Mail, Send, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface EmailComposerProps {
  onSend: (emailData: {
    recipients: string[];
    subject: string;
    message: string;
  }) => void;
}

const EmailComposer = ({ onSend }: EmailComposerProps) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const addRecipient = () => {
    if (currentEmail && isValidEmail(currentEmail) && !recipients.includes(currentEmail)) {
      setRecipients([...recipients, currentEmail]);
      setCurrentEmail('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleSend = () => {
    if (recipients.length > 0 && subject.trim()) {
      onSend({
        recipients,
        subject: subject.trim(),
        message: message.trim()
      });
    }
  };

  const canSend = recipients.length > 0 && subject.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="w-5 h-5 text-electric-600" />
        <h3 className="text-lg font-semibold text-foreground">Email Delivery</h3>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipients" className="text-sm font-medium text-foreground">
              Recipients
            </Label>
            <div className="mt-2">
              <div className="flex space-x-2">
                <Input
                  id="recipients"
                  type="email"
                  placeholder="Enter email address..."
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={addRecipient}
                  disabled={!currentEmail || !isValidEmail(currentEmail)}
                  className="bg-electric-500 hover:bg-electric-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {recipients.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center space-x-1 py-1"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => removeRecipient(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-medium text-foreground">
              Subject
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium text-foreground">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} selected
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-electric-500 hover:bg-electric-600 text-white px-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Files
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmailComposer;
