import React from 'react';
import { Button } from './ui/button';

interface DaySelectorProps {
  selectedDays: string[];
  onSelectionChange: (days: string[]) => void;
}

const DAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

export function DaySelector({ selectedDays, onSelectionChange }: DaySelectorProps) {
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      onSelectionChange(selectedDays.filter(d => d !== day));
    } else {
      onSelectionChange([...selectedDays, day]);
    }
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day.full);
        return (
          <Button
            key={day.full}
            onClick={() => handleDayToggle(day.full)}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="h-10 text-xs"
          >
            {day.short}
          </Button>
        );
      })}
    </div>
  );
}