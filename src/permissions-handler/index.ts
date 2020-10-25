import { Ability, AbilityBuilder, PureAbility } from '@casl/ability';

type Role = 'member' | 'admin' | 'moderator';

export interface User {
  id: number;
  username: string;
  email?: string;
  password: string;
  role: Role;
}

export interface Category {
  parent_id: number;
  name: string;
}

export interface Post {
  title: string;
  sticky: boolean;
  category: number;
  body: string;
  author_id: number;
  images?: string;
}

export interface Comment {
  post_id: number;
  parent_id: number;
  body: string;
  author_id: number;
}

type DefinePermissions = (user: User, builder: AbilityBuilder<Ability>) => void;

const rolePermissions: Record<Role, DefinePermissions> = {
  member(user, { can, cannot }) {
    can('manage', 'User', { id: user.id });
    can('manage', ['Post', 'Comment'], { author_id: user.id });
    cannot('update', 'Post', ['sticky', 'category']);
  },
  moderator(user, { can }) {
    can('manage', 'User', { id: user.id });
    can('manage', ['Post', 'Comment'], { author_id: user.id });
    can('delete', ['Post', 'Comment']);
    can('update', 'Post', ['sticky', 'category']);
  },
  admin(_, { can }) {
    can('manage', 'all');
  },
};

export function defineAbilityFor(user: User): PureAbility {
  const builder = new AbilityBuilder<Ability>(Ability);

  rolePermissions[user.role](user, builder);

  return builder.build();
}
