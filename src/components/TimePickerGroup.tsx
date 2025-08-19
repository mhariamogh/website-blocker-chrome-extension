import React from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePickerGroupProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTime(timeString);
      times.push({ value: timeString, display: displayTime });
    }
  }
  return times;
};

const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export function TimePickerGroup({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange 
}: TimePickerGroupProps) {
  const timeOptions = generateTimeOptions();

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 space-y-2">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Select value={startTime} onValueChange={onStartTimeChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Start time">
              {startTime ? formatTime(startTime) : "Start time"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {timeOptions.map(({ value, display }) => (
              <SelectItem key={value} value={value}>
                <span className="text-sm">{display}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center pt-6">
        <span className="text-muted-foreground text-sm">→</span>
      </div>

      <div className="flex-1 space-y-2">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Select value={endTime} onValueChange={onEndTimeChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="End time">
              {endTime ? formatTime(endTime) : "End time"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {timeOptions.map(({ value, display }) => (
              <SelectItem key={value} value={value}>
                <span className="text-sm">{display}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}