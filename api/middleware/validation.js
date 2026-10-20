import { z } from 'zod';

const eventSchema = z.object({
  app_name: z.string().min(1),
  window_title: z.string().nullable().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime()
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: 'end_time must be after start_time',
  path: ['end_time']
});

export function validateEvent(req, res, next) {
  const result = eventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'invalid event payload',
      details: result.error.issues
    });
  }
  req.body = result.data;
  next();
}