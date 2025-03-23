"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Race } from "@/lib/db/schema/races";
import { useState } from "react";
import ViewRacesForYear from "./ViewRacesForYear";
import ViewResultsForRace from "./ViewResultsForRace";

// TODO: show the selected race above the results
// TODO: show time, etc
// TODO: better styling for the races
// TODO: find a way to show if the race is "completed" or "has results" or something
// TODO: show point history like Viktor suggested
// Maybe add date sorter and "completed"/"has result" checkbox

export default function Page() {
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

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
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedYear > 0 && <ViewRacesForYear year={selectedYear} setSelectedRace={setSelectedRace} />}
      {selectedRace && <ViewResultsForRace raceId={selectedRace.id} />}
    </div>
  );
}
