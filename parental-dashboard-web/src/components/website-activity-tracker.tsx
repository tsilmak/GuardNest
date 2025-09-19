"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityRecord {
  id: string;
  url: string;
  enteredAt: Date;
  leftAt: Date | null;
  duration?: number;
}

const MOCK_URLS = [
  "https://github.com/vercel/next.js",
  "https://tailwindcss.com/docs",
  "https://ui.shadcn.com/docs/components",
  "https://framer.com/motion",
  "https://react.dev/learn",
  "https://typescript-eslint.io/docs",
  "https://vercel.com/docs",
  "https://stackoverflow.com/questions/tagged/react",
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "https://nodejs.org/en/docs",
  "https://www.npmjs.com/package/react",
  "https://vitejs.dev/guide",
  "https://eslint.org/docs/latest",
  "https://prettier.io/docs/en",
  "https://jestjs.io/docs/getting-started",
  "https://testing-library.com/docs/react-testing-library/intro",
];

// Mock data generator
const generateMockData = (): Array<ActivityRecord> => {
  const records: Array<ActivityRecord> = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const enteredAt = new Date(
      now.getTime() - (i * 30 + Math.random() * 60) * 60000
    );
    const leftAt =
      Math.random() > 0.3
        ? new Date(enteredAt.getTime() + (Math.random() * 20 + 2) * 60000)
        : null;
    const duration = leftAt
      ? Math.floor((leftAt.getTime() - enteredAt.getTime()) / 1000)
      : undefined;

    records.push({
      id: `session-${Date.now()}-${i}`,
      url: MOCK_URLS[Math.floor(Math.random() * MOCK_URLS.length)],
      enteredAt,
      leftAt,
      duration,
    });
  }

  return records.sort((a, b) => b.enteredAt.getTime() - a.enteredAt.getTime());
};

const generateNewActivity = (): ActivityRecord => {
  const now = new Date();
  const enteredAt = new Date(now.getTime() - Math.random() * 5 * 60000);
  const leftAt =
    Math.random() > 0.4
      ? new Date(enteredAt.getTime() + (Math.random() * 15 + 1) * 60000)
      : null;
  const duration = leftAt
    ? Math.floor((leftAt.getTime() - enteredAt.getTime()) / 1000)
    : undefined;

  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: MOCK_URLS[Math.floor(Math.random() * MOCK_URLS.length)],
    enteredAt,
    leftAt,
    duration,
  };
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export default function WebsiteActivityTracker() {
  const [activities, setActivities] = useState<Array<ActivityRecord>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<
    Array<ActivityRecord>
  >([]);

  const addNewActivity = useCallback(() => {
    const newActivity = generateNewActivity();
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      // Keep the most recent 20 activities
      return updated.slice(0, 20);
    });
  }, []);

  useEffect(() => {
    const mockData = generateMockData();
    setActivities(mockData);
    setFilteredActivities(mockData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      addNewActivity();
    }, 3000); // Add new activity every 3 seconds

    return () => clearInterval(interval);
  }, [addNewActivity]);

  useEffect(() => {
    const filtered = activities.filter(
      (activity) =>
        activity.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extractDomain(activity.url)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredActivities(filtered);
  }, [searchQuery, activities]);

  return (
    <div className="mx-auto w-full space-y-3">
      {/* Search */}
      <div className="relative flex items-center gap-2">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search websites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
        <Button variant="secondary" className="hidden sm:flex">
          View all
        </Button>
      </div>

      {/* Activity list */}
      <div className="relative h-[200px] sm:h-[250px] lg:h-[300px] overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="space-y-2 p-1">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, _index) => (
                <motion.div
                  key={activity.id}
                  layout
                  layoutId={activity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="transform-gpu"
                >
                  <Card className="transition-colors p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-medium truncate text-xs">
                            {extractDomain(activity.url)}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 text-xs">
                        {/* Entry Time */}
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock className="h-3 w-3 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Time entered website</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="font-mono hidden sm:inline">
                            {formatTime(activity.enteredAt)}
                          </span>
                          <span className="font-mono sm:hidden">
                            {formatTime(activity.enteredAt).split(":")[0]}:
                            {formatTime(activity.enteredAt).split(":")[1]}
                          </span>
                        </div>

                        {/* Exit Time */}
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock className="h-3 w-3 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Time exited website</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="font-mono hidden sm:inline">
                            {activity.leftAt
                              ? formatTime(activity.leftAt)
                              : "Active"}
                          </span>
                          <span className="font-mono sm:hidden">
                            {activity.leftAt
                              ? `${formatTime(activity.leftAt).split(":")[0]}:${
                                  formatTime(activity.leftAt).split(":")[1]
                                }`
                              : "Active"}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="font-mono">
                            {activity.duration
                              ? formatDuration(activity.duration)
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "No activities match your search."
                    : "No activity records found."}
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
