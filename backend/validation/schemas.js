import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid Email Address'),
  password: z.string().min(1, 'Password is required')
});

export const lyricSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  writer_name: z.string().min(1, 'Writer name is required'),
  category: z.enum(['Bhajan', 'Koras'], {
     message: 'Category must be either Bhajan or Koras' 
  }),
  number: z.string().min(1, { message: 'Number is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  submitted_by: z.string().optional()
});

export const lyricUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  writer_name: z.string().min(1).optional(),
  category: z.enum(['Bhajan', 'Koras']).optional(),
  number: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'approved']).optional()
});
