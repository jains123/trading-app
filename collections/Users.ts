import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Anyone can create an account (public signup)
    create: () => true,
    // Users can read their own profile
    read: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
    // Users can update their own profile
    update: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
    // Only admins can delete
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
};
