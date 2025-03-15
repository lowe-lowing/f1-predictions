"use client";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { User } from "@/lib/db/schema/auth";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";
import { useRef, useState } from "react";

interface SearchUserProps {
  users: User[];
  onSelect: (user: User) => void;
}

export default function SearchUser({ users, onSelect }: SearchUserProps) {
  const [input, setInput] = useState("");

  const commandRef = useRef(null);
  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  return (
    <div className="flex gap-2 items-center">
      <Command className="relative max-w-lg overflow-visible rounded-lg border" ref={commandRef}>
        <CommandInput
          className="border-none outline-none ring-0 focus:border-none focus:outline-none"
          placeholder="Search users..."
          value={input}
          onValueChange={(value: string) => {
            setInput(value);
          }}
        />
        {input.length > 0 && (
          <CommandList className="absolute inset-x-0 top-full rounded-b-md bg-background shadow-md z-10">
            <CommandEmpty>No results found</CommandEmpty>
            {users && users.length > 0 && (
              <CommandGroup heading="Users">
                {users?.map((user: User) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      onSelect(user);
                      setInput("");
                    }}
                    value={user.name || undefined}
                  >
                    <Button variant={"ghost"} size={"sm"}>
                      <UserComponent user={user} />
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

export const UserComponent = ({ user }: { user: User }) => {
  return (
    <div className="flex gap-2 items-center">
      {user.image && <img src={user.image} alt={`No Picture`} className="h-10 w-10 text-xs sm:h-14 sm:w-14" />}
      <div className="text-left sm:mt-1">
        <div className="text-sm sm:text-lg/4">{user.name}</div>
        <div className="text-xs sm:text-sm sm:mt-1 text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
};
