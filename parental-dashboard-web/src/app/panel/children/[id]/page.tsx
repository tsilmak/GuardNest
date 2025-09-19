"use client";
import React from "react";
import { initialBlockedSites, mockChildren } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

function getDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getFaviconUrlForDomain(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export default function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const child = mockChildren.find((c) => c.id === id);
  const blocked = initialBlockedSites.filter((s) => s.childId === id);

  if (!child) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Child not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex h-14.5 shrink-0 items-center gap-2 px-4">
        <h1 className="text-xl sm:text-2xl font-semibold">{child.name}</h1>
      </header>
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-h-0">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Blocked Websites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80 sm:h-96 px-4 sm:px-6 pb-4 sm:pb-6">
              {blocked.length === 0 ? (
                <div className="text-sm text-muted-foreground p-6">
                  No blocked websites for {child.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {blocked.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 relative w-5 h-5">
                          <img
                            src={getFaviconUrlForDomain(getDomain(site.url))}
                            alt="Favicon"
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {site.url}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {child.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
