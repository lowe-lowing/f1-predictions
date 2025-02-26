"use client";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Driver } from "@/lib/db/schema/drivers";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";
import { useRef, useState } from "react";
import { DriverComponent } from "./DriverComponent";

interface SearchDriverProps {
  drivers: Driver[];
  onSelect: (driver: Driver) => void;
}

export default function SearchDriver({ drivers, onSelect }: SearchDriverProps) {
  const [input, setInput] = useState("");

  const commandRef = useRef(null);
  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  return (
    <div className="flex gap-2 items-center">
      <Command className="relative  max-w-lg overflow-visible rounded-lg border" ref={commandRef}>
        <CommandInput
          className="border-none outline-none ring-0 focus:border-none focus:outline-none"
          placeholder="Search drivers..."
          value={input}
          onValueChange={(value: string) => {
            setInput(value);
          }}
        />
        {input.length > 0 && (
          <CommandList className="absolute inset-x-0 top-full rounded-b-md bg-background shadow-md z-10">
            <CommandEmpty>No results found</CommandEmpty>
            {drivers && drivers.length > 0 && (
              <CommandGroup heading="Drivers">
                {drivers?.map((driver: Driver) => (
                  <CommandItem
                    key={driver.id}
                    onSelect={() => {
                      onSelect(driver);
                      setInput("");
                    }}
                    value={driver.name || undefined}
                  >
                    <Button variant={"ghost"} size={"sm"}>
                      <DriverComponent driver={driver} />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
