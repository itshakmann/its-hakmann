import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code, 
  Lightbulb, 
  PenTool, 
  Calculator,
  Globe,
  Briefcase,
  Heart
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  icon: React.ReactNode;
  tags: string[];
}

interface ChatTemplatesProps {
  onTemplateSelect: (prompt: string) => void;
}

export const ChatTemplates: React.FC<ChatTemplatesProps> = ({ onTemplateSelect }) => {
  const templates: Template[] = [
    {
      id: 'study-helper',
      title: 'Study Helper',
      description: 'Get help with homework and study materials',
      prompt: 'I need help studying for my upcoming exam. Can you help me create a study plan and explain key concepts?',
      category: 'Academic',
      icon: <BookOpen className="h-4 w-4" />,
      tags: ['study', 'exam', 'homework']
    },
    {
      id: 'coding-mentor',
      title: 'Coding Mentor',
      description: 'Learn programming and debug code',
      prompt: 'I\'m learning to code and need help understanding programming concepts. Can you be my coding mentor?',
      category: 'Programming',
      icon: <Code className="h-4 w-4" />,
      tags: ['programming', 'debug', 'learn']
    },
    {
      id: 'creative-writing',
      title: 'Creative Writing',
      description: 'Brainstorm ideas and improve writing',
      prompt: 'I want to improve my creative writing skills. Can you help me brainstorm ideas and provide feedback?',
      category: 'Creative',
      icon: <PenTool className="h-4 w-4" />,
      tags: ['writing', 'creative', 'story']
    },
    {
      id: 'problem-solver',
      title: 'Problem Solver',
      description: 'Work through complex problems step-by-step',
      prompt: 'I have a complex problem that I need to solve. Can you help me break it down and find solutions?',
      category: 'Analysis',
      icon: <Lightbulb className="h-4 w-4" />,
      tags: ['problem', 'analysis', 'solution']
    },
    {
      id: 'math-tutor',
      title: 'Math Tutor',
      description: 'Get help with mathematical concepts',
      prompt: 'I need help understanding mathematical concepts and solving problems. Can you be my math tutor?',
      category: 'Academic',
      icon: <Calculator className="h-4 w-4" />,
      tags: ['math', 'tutor', 'problems']
    },
    {
      id: 'language-partner',
      title: 'Language Partner',
      description: 'Practice languages and improve fluency',
      prompt: 'I want to practice a new language and improve my fluency. Can you help me with conversation practice?',
      category: 'Language',
      icon: <Globe className="h-4 w-4" />,
      tags: ['language', 'practice', 'fluency']
    },
    {
      id: 'career-advisor',
      title: 'Career Advisor',
      description: 'Get guidance on career development',
      prompt: 'I need advice on my career path and professional development. Can you help me plan my next steps?',
      category: 'Career',
      icon: <Briefcase className="h-4 w-4" />,
      tags: ['career', 'advice', 'development']
    },
    {
      id: 'wellness-coach',
      title: 'Wellness Coach',
      description: 'Support for mental health and wellbeing',
      prompt: 'I want to improve my mental health and overall wellbeing. Can you provide guidance and support?',
      category: 'Wellness',
      icon: <Heart className="h-4 w-4" />,
      tags: ['wellness', 'health', 'support']
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Start Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template to get started with your conversation
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </h4>
          <div className="grid gap-3">
            {templates
              .filter(template => template.category === category)
              .map(template => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onTemplateSelect(template.prompt)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {template.icon}
                        {template.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};