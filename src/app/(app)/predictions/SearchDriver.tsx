"use client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useCallback, useState } from "react";
import { Driver } from "@/lib/db/schema/drivers";
// import debounce from "lodash.debounce";

// TODO: make it select the driver in the parent component
interface SearchDriverProps {
    drivers: Driver[];
    // onSelect: (driver: Driver) => void;
}

export default function SearchDriver({ drivers }: SearchDriverProps) {
    const [input, setInput] = useState("");
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([...drivers]);

    return (
        // TODO: fix ui here
        <div className="flex gap-2 items-center">
            <Command className="relative  max-w-lg overflow-visible rounded-lg border">
                <CommandInput
                    className="border-none outline-none ring-0 focus:border-none focus:outline-none"
                    placeholder="Search drivers..."
                    // isLoading={isFetching}
                    value={input}
                    onValueChange={(value) => {
                        setInput(value);
                        // debounceRequest();
                    }}
                />
                {input.length > 0 && (
                    <CommandList className="absolute inset-x-0 top-full rounded-b-md bg-background shadow-md z-10">
                        <CommandEmpty>No results found</CommandEmpty>
                        {filteredDrivers && filteredDrivers.length > 0 && (
                            <CommandGroup heading="Drivers">
                                {filteredDrivers?.map((driver: Driver) => (
                                    <CommandItem
                                        key={driver.id}
                                        onSelect={() => {
                                            setSelectedDriver(driver);
                                            setInput("");
                                        }}
                                        value={driver.name || undefined}
                                    >
                                        <Button variant={"ghost"} size={"sm"}>
                                            {driver.image && (<img src={driver.image} alt="" className="mr-1 h-6 w-6" />)}
                                            {/* <Avatar user={user} className="mr-1 h-6 w-6" /> */}
                                            <div className="text-sm">{driver.name}</div>
                                        </Button>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                )}
            </Command>
            <div>
                {selectedDriver && (
                    <div className="flex items-center">
                        {selectedDriver.image && (<img src={selectedDriver.image} alt="" className="mr-1 h-6 w-6" />)}
                        <div className="text-sm">{selectedDriver.name}</div>
                    </div>
                )}
            </div>
        </div>

    )
}