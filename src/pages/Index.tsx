import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, MessageSquare, Shield, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary rounded-full p-6">
              <GraduationCap className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">
            CKT-UTAS Student Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your intelligent 24/7 AI companion for all academic queries at 
            C.K. Tedam University of Technology and Applied Sciences
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-primary">Intelligent Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant answers to your academic questions with our AI-powered chatbot 
                trained on university-specific information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-primary">24/7 Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access assistance anytime, anywhere. Whether it's late night studying 
                or early morning questions, we're here to help.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-primary">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your personal information and chat history are protected with 
                enterprise-grade security and privacy measures.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What You Can Ask Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">
            What Can You Ask?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">Academic Queries</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Course registration procedures</li>
                <li>• Examination schedules and results</li>
                <li>• Academic calendar and deadlines</li>
                <li>• Resit examination information</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">Administrative Help</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Fee payment deadlines and methods</li>
                <li>• Student ID and documentation</li>
                <li>• University policies and regulations</li>
                <li>• Contact information for departments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
