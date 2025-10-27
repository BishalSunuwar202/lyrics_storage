import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      schema.parse(req.body);
      next();
    } catch (error) {
      //console.log('Is ZodError?', error instanceof z.ZodError);
      //console.log('Error:', error);
      
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({ errors });
      }
      // If not a ZodError, return generic error
      return res.status(400).json({ error: error.message || 'Validation failed' });
    }
  };
};
