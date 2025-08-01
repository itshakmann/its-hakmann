import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  BookOpen, 
  Clock,
  AlertCircle
} from 'lucide-react';

const suggestions = [
  {
    icon: Calendar,
    title: "Check Academic Calendar",
    description: "View important dates and deadlines",
    query: "What are the important academic dates this semester?",
    color: "text-blue-600"
  },
  {
    icon: DollarSign,
    title: "Fee Payment Information",
    description: "Learn about payment deadlines and methods",
    query: "When is the deadline for fee payment?",
    color: "text-green-600"
  },
  {
    icon: FileText,
    title: "Results and Transcripts",
    description: "Get information about checking results",
    query: "How can I check my examination results?",
    color: "text-purple-600"
  },
  {
    icon: BookOpen,
    title: "Course Registration",
    description: "Learn about course registration procedures",
    query: "How do I register for courses this semester?",
    color: "text-orange-600"
  },
  {
    icon: Clock,
    title: "Resit Examinations",
    description: "Information about resit registration and dates",
    query: "How do I register for resit examinations?",
    color: "text-red-600"
  },
  {
    icon: AlertCircle,
    title: "Academic Policies",
    description: "Understand university rules and regulations",
    query: "What are the academic policies I should know about?",
    color: "text-indigo-600"
  }
];

export const AcademicSuggestions: React.FC = () => {
  const handleSuggestionClick = (query: string) => {
    // This could trigger the chat interface with the suggested query
    // For now, we'll just scroll to the chat
    const chatElement = document.querySelector('[data-chat-interface]');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent/50 transition-colors"
              onClick={() => handleSuggestionClick(suggestion.query)}
            >
              <div className="flex items-center gap-2 w-full">
                <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                <span className="font-medium text-left">{suggestion.title}</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {suggestion.description}
              </p>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="bg-primary rounded-full p-1">
              <AlertCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-primary mb-1">Quick Tip</h4>
              <p className="text-sm text-muted-foreground">
                You can ask me questions in your own words! I understand various ways of asking about the same topic.
                For example, instead of exact phrases, try "When do I pay fees?" or "Fee payment deadline".
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};