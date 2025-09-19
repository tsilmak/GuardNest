export type Child = {
  id: string;
  name: string;
};

export const mockChildren: Array<Child> = [
  { id: "a3f2c6d0-1b23-4a56-8e9f-01a2b3c4d5e6", name: "Emma" },
  { id: "b7d9e1f2-3a45-6b78-9c01-2d3e4f5a6b7c", name: "Liam" },
  { id: "c9e8d7f6-5a43-2b10-9e8d-7f6e5d4c3b2a", name: "Sophia" },
  { id: "d1e2f3a4-b5c6-7d8e-9f01-23456789abcd", name: "Noah" },
];

export type BlockedWebsite = {
  id: string;
  url: string;
  childId: string;
  childName: string;
  dateAdded: string;
};

export const initialBlockedSites: Array<BlockedWebsite> = [
  {
    id: "1",
    url: "facebook.com",
    childId: mockChildren[0].id,
    childName: mockChildren[0].name,
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    url: "instagram.com",
    childId: mockChildren[0].id,
    childName: mockChildren[0].name,
    dateAdded: "2024-01-16",
  },
  {
    id: "3",
    url: "tiktok.com",
    childId: mockChildren[1].id,
    childName: mockChildren[1].name,
    dateAdded: "2024-01-17",
  },
  {
    id: "4",
    url: "youtube.com",
    childId: mockChildren[2].id,
    childName: mockChildren[2].name,
    dateAdded: "2024-01-18",
  },
  {
    id: "5",
    url: "twitter.com",
    childId: mockChildren[3].id,
    childName: mockChildren[3].name,
    dateAdded: "2024-01-19",
  },
  {
    id: "6",
    url: "reddit.com",
    childId: mockChildren[0].id,
    childName: mockChildren[0].name,
    dateAdded: "2024-01-20",
  },
  {
    id: "7",
    url: "snapchat.com",
    childId: mockChildren[1].id,
    childName: mockChildren[1].name,
    dateAdded: "2024-01-21",
  },
  {
    id: "8",
    url: "discord.com",
    childId: mockChildren[2].id,
    childName: mockChildren[2].name,
    dateAdded: "2024-01-22",
  },
];
