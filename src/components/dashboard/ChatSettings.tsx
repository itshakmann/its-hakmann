import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Zap, Brain, MessageSquare } from 'lucide-react';

interface ChatSettingsProps {
  settings: {
    temperature: number;
    maxTokens: number;
    model: string;
    streaming: boolean;
    contextMemory: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Model Settings
          </DialogTitle>
          <DialogDescription>
            Customize how the AI responds to your messages
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Model
            </Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                <SelectItem value="claude-3">Claude 3 (Analytical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <Label>Creativity Level: {localSettings.temperature}</Label>
            <Slider
              value={[localSettings.temperature]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <Label>Response Length: {localSettings.maxTokens} tokens</Label>
            <Slider
              value={[localSettings.maxTokens]}
              onValueChange={([value]) => handleSettingChange('maxTokens', value)}
              max={4000}
              min={100}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>

          {/* Streaming */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Streaming Response
              </Label>
              <p className="text-sm text-muted-foreground">
                Show response as it's being generated
              </p>
            </div>
            <Switch
              checked={localSettings.streaming}
              onCheckedChange={(checked) => handleSettingChange('streaming', checked)}
            />
          </div>

          {/* Context Memory */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Context Memory
              </Label>
              <p className="text-sm text-muted-foreground">
                Remember conversation context across sessions
              </p>
            </div>
            <Switch
              checked={localSettings.contextMemory}
              onCheckedChange={(checked) => handleSettingChange('contextMemory', checked)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};