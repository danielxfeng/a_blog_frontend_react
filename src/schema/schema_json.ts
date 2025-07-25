import { z } from 'zod';

import { UrlSchema } from './schema_components';

const ProjectSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  coverUrl: UrlSchema,
  description: z.string().trim().min(1),
  stack: z.array(z.string().trim().min(1)),
  projectLink: UrlSchema,
  siteLink: UrlSchema.nullable(),
  hasSite: z.boolean(),
  tags: z.array(z.string().trim().min(1)),
});

const ProjectsSchema = z.array(ProjectSchema);

type Project = z.infer<typeof ProjectSchema>;

export { ProjectSchema, ProjectsSchema };

export type { Project };
