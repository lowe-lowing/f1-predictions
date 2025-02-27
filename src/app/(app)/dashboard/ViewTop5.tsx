"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type FC } from "react";
import ViewRacesForYear from "./ViewRacesForYear";
import ViewTop5ByRace from "./ViewTop5ByRace";

const ViewTop5: FC = () => {
  const [year, setYear] = useState(0);
  const [selectedRace, setSelectedRace] = useState<any>(null);

  return (
    <div className="space-y-4">
      <Select onValueChange={(value) => setYear(parseInt(value))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {year > 0 && <ViewRacesForYear year={year} setSelectedRace={setSelectedRace} />}
      {selectedRace && <ViewTop5ByRace meetingKey={selectedRace.meeting_key} />}
    </div>
  );
};

export default ViewTop5;
