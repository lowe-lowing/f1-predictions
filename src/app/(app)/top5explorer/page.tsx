"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type FC } from "react";
import ViewRacesForYear from "./ViewRacesForYear";
import ViewTop5ByRace from "./ViewTop5ByRace";

export default function Page() {
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedRace, setSelectedRace] = useState<any>(null);

  return (
    <div className="space-y-4">
      <Select
        onValueChange={(value) => {
          setSelectedYear(parseInt(value));
          setSelectedRace(null);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedYear > 0 && <ViewRacesForYear year={selectedYear} setSelectedRace={setSelectedRace} />}
      {selectedRace && <ViewTop5ByRace meetingKey={selectedRace.meeting_key} />}
    </div>
  );
}
