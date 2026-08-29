export type Vendor = {
  id: string;
  name: string;
};

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Ambika Advertising' },
  { id: 'v2', name: 'Skyline Media' },
  { id: 'v3', name: 'Urban Outdoor Media' },
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

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: 'checkmark-circle' | 'alert-circle' | 'document-text' | 'megaphone';
  read: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Task completed',
    message: 'Seawoods mounting task was marked complete.',
    time: '10 min ago',
    icon: 'checkmark-circle',
    read: false,
  },
  {
    id: 'n2',
    title: 'Pending approval',
    message: 'Vashi Railway Station banner is awaiting vendor approval.',
    time: '2 hr ago',
    icon: 'alert-circle',
    read: false,
  },
  {
    id: 'n3',
    title: 'New task assigned',
    message: 'Ambika Yogkutir Towards Thane station has been assigned to you.',
    time: 'Yesterday',
    icon: 'document-text',
    read: true,
  },
  {
    id: 'n4',
    title: 'App update',
    message: 'MMX v1.2 is now available with faster image uploads.',
    time: '2 days ago',
    icon: 'megaphone',
    read: true,
  },
];

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    id: 'f1',
    question: 'How do I mark a task as complete?',
    answer: 'Open the task from My Task, fill in the required details, and tap Complete at the bottom of the form.',
  },
  {
    id: 'f2',
    question: 'How do I add photos to a task?',
    answer: 'Inside the task form, tap the + next to "Add images" to pick a photo from your gallery.',
  },
  {
    id: 'f3',
    question: 'Can I change the vendor after login?',
    answer: 'Yes, go to Profile > Logout, then log back in to pick a different vendor.',
  },
  {
    id: 'f4',
    question: 'Who do I contact for urgent issues?',
    answer: 'Reach out to your MMX support coordinator via the contact details below.',
  },
];

export const supportContact = {
  phone: '+91 98765 43210',
  email: 'support@bindassdealdigital.com',
  hours: 'Mon - Sat, 9:00 AM - 7:00 PM IST',
};

export const aboutInfo = {
  version: '1.0.0',
  description:
    'MMX Mounter helps field teams manage outdoor advertising installations — from task assignment to on-site photo proof and completion tracking.',
  company: 'Bindass Deal Digital',
  website: 'www.bindassdealdigital.com',
};
