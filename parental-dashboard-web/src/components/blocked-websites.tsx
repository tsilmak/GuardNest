"use client";

import { useEffect, useState } from "react";
import { Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface BlockedWebsite {
  id: string;
  url: string;
  childName: string;
  dateAdded: string;
}

const mockChildren = [
  { id: "1", name: "Emma" },
  { id: "2", name: "Liam" },
  { id: "3", name: "Sophia" },
  { id: "4", name: "Noah" },
];

const initialBlockedSites: Array<BlockedWebsite> = [
  { id: "1", url: "facebook.com", childName: "Emma", dateAdded: "2024-01-15" },
  { id: "2", url: "instagram.com", childName: "Emma", dateAdded: "2024-01-16" },
  { id: "3", url: "tiktok.com", childName: "Liam", dateAdded: "2024-01-17" },
  { id: "4", url: "youtube.com", childName: "Sophia", dateAdded: "2024-01-18" },
  { id: "5", url: "twitter.com", childName: "Noah", dateAdded: "2024-01-19" },
  { id: "6", url: "reddit.com", childName: "Emma", dateAdded: "2024-01-20" },
  { id: "7", url: "snapchat.com", childName: "Liam", dateAdded: "2024-01-21" },
  { id: "8", url: "discord.com", childName: "Sophia", dateAdded: "2024-01-22" },
];

export function BlockedWebsitesCard() {
  const [blockedSites, setBlockedSites] =
    useState<Array<BlockedWebsite>>(initialBlockedSites);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedChild, setSelectedChild] = useState("");

  const [faviconUrl, setFaviconUrl] = useState("");
  const [isFaviconLoading, setIsFaviconLoading] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    siteId: string;
    siteUrl: string;
  }>({
    isOpen: false,
    siteId: "",
    siteUrl: "",
  });

  const handleAddWebsite = () => {
    if (!newUrl.trim() || !selectedChild) return;

    const newSite: BlockedWebsite = {
      id: Date.now().toString(),
      url: newUrl
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, ""),
      childName:
        mockChildren.find((child) => child.id === selectedChild)?.name || "",
      dateAdded: new Date().toISOString().split("T")[0],
    };

    setBlockedSites((prev) => [newSite, ...prev]);
    setNewUrl("");
    setSelectedChild("");
    setIsDialogOpen(false);
  };

  const handleRemoveWebsite = (id: string) => {
    setBlockedSites((prev) => prev.filter((site) => site.id !== id));
  };

  const showDeleteConfirmation = (id: string, url: string) => {
    setDeleteConfirmation({ isOpen: true, siteId: id, siteUrl: url });
  };

  const confirmDelete = () => {
    handleRemoveWebsite(deleteConfirmation.siteId);
    setDeleteConfirmation({ isOpen: false, siteId: "", siteUrl: "" });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, siteId: "", siteUrl: "" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  // Generate favicon URL when domain changes
  useEffect(() => {
    if (newUrl.trim()) {
      // Remove protocol if present
      const cleanDomain = newUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const newFaviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=32`;
      setIsFaviconLoading(true);
      setFaviconUrl(newFaviconUrl);
    } else {
      setFaviconUrl("");
      setIsFaviconLoading(false);
    }
  }, [newUrl]);

  const getDomain = (value: string) =>
    value.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const getFaviconUrlForDomain = (domain: string) =>
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                Blocked Websites
              </CardTitle>
              <div className="mt-1">
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                >
                  <a href="/blocked-websites">See all</a>
                </Button>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Blocked Website</DialogTitle>
                  <DialogDescription>
                    Enter the website URL and select which child this applies
                    to.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <div className="relative">
                      <Input
                        id="url"
                        type="text"
                        placeholder="example.com or subdomain.example.com"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full pr-10"
                      />
                      {/* Favicon */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {faviconUrl && (
                          <img
                            src={faviconUrl}
                            alt="Favicon"
                            className={`w-5 h-5 transform transition-all duration-200 ${
                              isFaviconLoading
                                ? "opacity-0 scale-90"
                                : "opacity-100 scale-100"
                            }`}
                            onError={() => {
                              // Clear favicon if it fails to load and stop loading state
                              setFaviconUrl("");
                              setIsFaviconLoading(false);
                            }}
                            onLoad={() => {
                              // Stop loading state when favicon finishes loading
                              setIsFaviconLoading(false);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="fullUrl" className="text-sm font-medium">
                        Full URL
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <Input
                      id="fullUrl"
                      type="text"
                      placeholder="https://example.com/path"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      This feature will allow you to block websites with paths.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child">Child</Label>
                    <Select
                      value={selectedChild}
                      onValueChange={setSelectedChild}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a child" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockChildren.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddWebsite}
                    disabled={!newUrl.trim() || !selectedChild}
                    className="w-full"
                  >
                    Add Website
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 sm:h-96 px-4 sm:px-6 pb-4 sm:pb-6">
            {blockedSites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No blocked websites
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add websites to start blocking them for your children.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedSites.map((site) => (
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
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {site.url}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {site.childName}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Added {formatDate(site.dateAdded)}
                          </span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {formatDate(site.dateAdded)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showDeleteConfirmation(site.id, site.url)}
                      className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open: boolean) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Blocked Website</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">{deleteConfirmation.siteUrl}</span>{" "}
              from the blocked websites list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Website
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
