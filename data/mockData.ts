export type PhotoType = 'day' | 'night';

export type Vendor = {
  id: string;
  name: string;
};

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Ambika Advertising' },
  { id: 'v2', name: 'Skyline Media' },
  { id: 'v3', name: 'Urban Outdoor Media' },
];

export type Task = {
  id: string;
  title: string;
  date: string;
  photoTypes: PhotoType[];
  bannerSize?: string;
  location?: string;
};

export const tasks: Task[] = [
  { id: 't1', title: 'Seawoods', date: '21 Dec, 2021', photoTypes: ['day', 'night'], bannerSize: '16X20' },
  { id: 't2', title: 'Ambika Yogkutir Towards Thane station', date: '14 Jan, 2022', photoTypes: ['day'], bannerSize: '20X18' },
  { id: 't3', title: 'Vashi Railway Station', date: '21 Dec, 2021', photoTypes: ['night'], bannerSize: '20X14' },
];

export type WorkSummaryEntry = {
  id: string;
  title: string;
  subtitle: string;
  tag: 'Note added' | 'Location added' | 'Image added';
  icon: 'document' | 'location' | 'camera';
};

export type WorkSummaryGroup = {
  date: string;
  entries: WorkSummaryEntry[];
};

export const workSummary: WorkSummaryGroup[] = [
  {
    date: 'Today',
    entries: [
      { id: 'w1', title: 'Seawoods', subtitle: 'Banner Size 16X20', tag: 'Note added', icon: 'document' },
      { id: 'w2', title: 'Seawoods', subtitle: 'Andheri West', tag: 'Location added', icon: 'location' },
    ],
  },
  {
    date: '20 Jan, 2022',
    entries: [
      { id: 'w3', title: 'Seawoods', subtitle: 'Banner Size 16X20', tag: 'Note added', icon: 'document' },
      { id: 'w4', title: 'Seawoods', subtitle: 'Andheri West', tag: 'Image added', icon: 'camera' },
    ],
  },
];

export type RecentActivity = {
  id: string;
  title: string;
  date: string;
  icon: 'calendar' | 'monitor';
  color: 'green' | 'orange';
};

export const recentActivity: RecentActivity[] = [
  { id: 'r1', title: 'Web Application Development', date: '03 Jan, 2022', icon: 'calendar', color: 'green' },
  { id: 'r2', title: 'Mobile Application', date: '21 Dec, 2021', icon: 'monitor', color: 'orange' },
];

export const currentUser = {
  name: 'Kavita Patil',
  firstName: 'Kavita',
};

export const mediaTypes = ['Hoarding', 'Banner', 'Digital Screen', 'Pole Kiosk'];
export const lightTypes = ['Front Lit', 'Back Lit', 'Non Lit'];
