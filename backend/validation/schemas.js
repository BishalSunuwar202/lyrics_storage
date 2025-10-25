import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const lyricSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  writer_name: z.string().min(1, 'Writer name is required'),
  category: z.enum(['Bhajan', 'Koras'], {
    errorMap: () => ({ message: 'Category must be either Bhajan or Koras' })
  }),
  number: z.string().min(1, 'Number is required'),
  content: z.string().min(1, 'Content is required'),
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
