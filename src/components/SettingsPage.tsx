import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { DaySelector } from './DaySelector';
import { TimePickerGroup } from './TimePickerGroup';

interface SettingsPageProps {
  onNavigateBack: () => void;
  onSave?: (data: {
    websites: string[];
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  }) => void;
  initialData?: {
    websites?: string[];
    schedule?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  };
}

export function SettingsPage({ onNavigateBack, onSave, initialData }: SettingsPageProps) {
  // Initialize with initial data if available, otherwise use defaults
  const [websites, setWebsites] = useState(
    initialData?.websites?.join('\n') || "instagram.com\ntwitter.com\nfacebook.com\nyoutube.com"
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.schedule?.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  );
  const [startTime, setStartTime] = useState(
    initialData?.schedule?.startTime || "09:00"
  );
  const [endTime, setEndTime] = useState(
    initialData?.schedule?.endTime || "17:00"
  );

  const handleSave = () => {
    // Parse websites from textarea (split by lines and filter empty ones)
    const websiteList = websites
      .split('\n')
      .map(site => site.trim())
      .filter(site => site.length > 0);

    const updatedData = {
      websites: websiteList,
      schedule: {
        days: selectedDays,
        startTime,
        endTime
      }
    };

    // Call the onSave callback to update the main app state
    if (onSave) {
      onSave(updatedData);
    }
    
    console.log('Settings saved:', updatedData);
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={onNavigateBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-muted focus:bg-muted focus:ring-2 focus:ring-ring rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
            <p className="text-sm text-muted-foreground">Configure your blocking preferences</p>
          </div>
        </div>

        {/* Websites Section */}
        <Card className="p-4 bg-card border border-border rounded-lg space-y-3">
          <div>
            <Label htmlFor="websites-input" className="text-sm font-medium text-card-foreground">
              WEBSITES TO BLOCK
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Enter one website per line (e.g., instagram.com)
            </p>
          </div>
          <Textarea
            id="websites-input"
            value={websites}
            onChange={(e) => setWebsites(e.target.value)}
            placeholder="instagram.com&#10;twitter.com&#10;facebook.com"
            className="min-h-[100px] bg-background border-border rounded-md resize-none text-sm"
            rows={5}
          />
        </Card>

        {/* Schedule Section */}
        <Card className="p-4 bg-card border border-border rounded-lg space-y-4">
          <div>
            <Label className="text-sm font-medium text-card-foreground">BLOCKING SCHEDULE</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Choose when to block distracting websites
            </p>
          </div>
          
          {/* Day Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Days</Label>
            <DaySelector 
              selectedDays={selectedDays}
              onSelectionChange={setSelectedDays}
            />
          </div>

          {/* Time Pickers */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Hours</Label>
            <TimePickerGroup
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
          </div>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
        >
          Save Changes
        </Button>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Changes take effect immediately
          </p>
        </div>
      </div>
    </div>
  );
}