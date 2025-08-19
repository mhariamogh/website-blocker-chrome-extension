import React, { useState, useEffect } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Settings } from 'lucide-react';

interface PopupHomeProps {
  onNavigateToSettings: () => void;
  blockedWebsites?: string[];
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  isBlocking?: boolean;
  onToggleBlocking?: (enabled: boolean) => void;
}

export function PopupHome({ 
  onNavigateToSettings, 
  blockedWebsites = [], 
  schedule,
  isBlocking = true,
  onToggleBlocking
}: PopupHomeProps) {
  const [shouldBlock, setShouldBlock] = useState(false);

  useEffect(() => {
    // Get current blocking status from background script
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
      if (response) {
        setShouldBlock(response.shouldBlock);
      }
    });
  }, [schedule]);

  // Helper function to format days for display
  const formatDays = (days: string[]) => {
    const dayAbbreviations: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    
    return days.map(day => dayAbbreviations[day] || day).join(', ');
  };

  // Helper function to get schedule duration
  const getScheduleDuration = () => {
    if (!schedule?.startTime || !schedule?.endTime) return "8h";
    const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
    const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    
    return `${hours}h`;
  };

  const handleToggleChange = (enabled: boolean) => {
    onToggleBlocking?.(enabled);
    // Tell background script to update blocking rules
    chrome.runtime.sendMessage({ action: 'updateBlocking' });
  };

  const getStatusText = () => {
    if (!isBlocking) {
      return '○ Blocking disabled';
    }
    if (shouldBlock) {
      return '✓ You\'re distraction-free';
    }
    return '○ Outside focus hours';
  };

  const getStatusColor = () => {
    if (!isBlocking) return 'text-gray-500';
    if (shouldBlock) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Website Blocker</h2>
          <p className="text-sm text-muted-foreground">Stay focused and productive</p>
        </div>

        {/* Status Card */}
        <Card className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-card-foreground">Blocking Status</h4>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
            <Switch 
              checked={isBlocking}
              onCheckedChange={handleToggleChange}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-3">
          {/* Top Row - Sites and Hours */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border border-border rounded-lg">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-card-foreground">{blockedWebsites.length}</p>
                <p className="text-xs text-muted-foreground">Sites blocked</p>
              </div>
            </Card>
            
            <Card className="p-4 bg-card border border-border rounded-lg">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-card-foreground">{getScheduleDuration()}</p>
                <p className="text-xs text-muted-foreground">Focus hours</p>
              </div>
            </Card>
          </div>
          
          {/* Bottom Row - Schedule */}
          <Card className="p-4 bg-card border border-border rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-card-foreground">Schedule</h5>
                <span className="text-xs text-muted-foreground">
                  {schedule?.days && schedule.days.length > 0 
                    ? `${schedule.days.length} days`
                    : "No days set"}
                </span>
              </div>
              {schedule?.days && schedule.days.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {schedule.days.map((day) => (
                    <span 
                      key={day}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Settings Button */}
        <Button 
          onClick={onNavigateToSettings}
          variant="outline"
          className="w-full"
        >
          <Settings className="w-4 h-4 mr-2" />
          Modify schedule
        </Button>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isBlocking && shouldBlock ? 'Blocking active during work hours' : 'Blocking inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}