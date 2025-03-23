"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Race } from "@/lib/db/schema/races";
import { useState } from "react";
import ViewRacesForYear from "./ViewRacesForYear";
import ViewResultsForRace from "./ViewResultsForRace";
import { seasons } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO: find a way to show if the race is "completed" or "has results" or something
// TODO: show point history like Viktor suggested
// Maybe add date sorter and "completed"/"has result" checkbox

export default function Page() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-2xl">Results Explorer</p>
      <div className="flex items-center gap-2">
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
              {seasons.map((season) => (
                <SelectItem key={season} value={season.toString()}>
                  {season}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedRace && (
          <Button variant={"ghost"} size={"icon"} className="[&_svg]:size-6" onClick={() => setSelectedRace(null)}>
            <ArrowLeft />
          </Button>
        )}
      </div>
      {selectedYear && !selectedRace && <ViewRacesForYear year={selectedYear} setSelectedRace={setSelectedRace} />}
      {selectedRace && <ViewResultsForRace race={selectedRace} />}
    </div>
  );
}
