"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seasons } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SeasonPickerProps {
  title: string;
  path: string;
}

export default function SeasonPicker({ title, path }: SeasonPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  let season = pathname.split("/")[2];
  if (!seasons.includes(Number(season))) {
    router.push(`/${path}/${seasons[0]}`);
    season = seasons[0].toString();
  }
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <h1 className="font-semibold text-xl sm:text-2xl my-2">{title}</h1>
        <Tabs defaultValue={season} className="w-[400px]">
          <TabsList>
            {seasons.map((season) => (
              <Link key={season} href={`/${path}/${season}`}>
                <TabsTrigger value={season.toString()}>{season}</TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
