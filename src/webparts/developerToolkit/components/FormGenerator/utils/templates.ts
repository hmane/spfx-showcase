import { SampleTemplate } from '../types/FormGeneratorTypes';

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Basic contact form with name, email, and message',
    category: 'Basic',
    code: `interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  newsletter: boolean;
}`,
  },
  {
    id: 'user-registration',
    name: 'User Registration',
    description: 'User registration with validation',
    category: 'Authentication',
    code: `interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  acceptTerms: boolean;
}`,
  },
  {
    id: 'product-form',
    name: 'Product Form',
    description: 'E-commerce product with pricing and inventory',
    category: 'E-commerce',
    code: `interface Product {
  title: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Clothing' | 'Books' | 'Other';
  stock: number;
  isActive: boolean;
  tags: string[];
}`,
  },
  {
    id: 'task-form',
    name: 'Task Form',
    description: 'Task management with assignment and dates',
    category: 'Productivity',
    code: `interface Task {
  title: string;
  description: string;
  status: 'New' | 'In Progress' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: User[];
  dueDate: Date;
  estimatedHours: number;
  isActive: boolean;
}`,
  },
  {
    id: 'event-form',
    name: 'Event Form',
    description: 'Event creation with dates and attendees',
    category: 'Calendar',
    code: `interface Event {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  attendees: User[];
  isAllDay: boolean;
  category: 'Meeting' | 'Training' | 'Social' | 'Other';
}`,
  },
  {
    id: 'employee-form',
    name: 'Employee Form',
    description: 'HR employee information form',
    category: 'HR',
    code: `interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Operations';
  position: string;
  startDate: Date;
  salary: number;
  manager: User;
  isActive: boolean;
}`,
  },
  {
    id: 'feedback-form',
    name: 'Feedback Form',
    description: 'Customer feedback and rating form',
    category: 'Survey',
    code: `interface Feedback {
  name: string;
  email: string;
  category: 'Product' | 'Service' | 'Support' | 'Other';
  rating: number;
  comments: string;
  wouldRecommend: boolean;
  contactMe: boolean;
}`,
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Blog post with metadata',
    category: 'Content',
    code: `interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: User;
  category: 'Technology' | 'Business' | 'Lifestyle' | 'News';
  tags: Taxonomy[];
  publishDate: Date;
  isPublished: boolean;
  featuredImage: Url;
}`,
  },
  {
    id: 'invoice-form',
    name: 'Invoice Form',
    description: 'Invoice with line items',
    category: 'Finance',
    code: `interface Invoice {
  invoiceNumber: string;
  client: Lookup;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes: string;
  isPaid: boolean;
}`,
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket',
    description: 'Customer support ticket form',
    category: 'Support',
    code: `interface SupportTicket {
  subject: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Question' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: User;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdDate: Date;
  attachments: Url[];
}`,
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SampleTemplate | undefined {
  return SAMPLE_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): SampleTemplate[] {
  return SAMPLE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  SAMPLE_TEMPLATES.forEach(t => categories.add(t.category));
  return Array.from(categories).sort();
}
