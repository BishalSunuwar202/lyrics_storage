import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid Email Address'),
  password: z.string().min(1, 'Password is required')
});

export const lyricSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  writer_name: z.string().optional(),
  category: z.enum(['Bhajan', 'Koras', 'Other'], {
     message: 'Category must be Bhajan, Koras, or Other'
  }),
  number: z.string().optional(),
  content: z.string().min(1, { message: 'Content is required' }),
  submitted_by: z.string().optional()
}).refine(data => data.category === 'Other' || (data.number && data.number.length > 0), {
  message: 'Number is required for Bhajan and Koras',
  path: ['number']
});

export const lyricUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  writer_name: z.string().min(1).optional(),
  category: z.enum(['Bhajan', 'Koras', 'Other']).optional(),
  number: z.string().optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved']).optional()
});
