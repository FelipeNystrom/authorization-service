import { Ability, AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';

type Role = 'member' | 'admin' | 'moderator';

export interface IUser {
  id: number;
  username: string;
  email?: string;
  password: string;
  role: Role;
}

export interface ICategory {
  parent_id: number;
  name: string;
}

export interface IPost {
  title?: string;
  sticky?: boolean;
  category?: number;
  body?: string;
  author_id?: number;
  images?: string;
}

export interface IComment {
  post_id?: number;
  parent_id?: number;
  body?: string;
  author_id?: number;
}

type Actions = 'create' | 'read' | 'update' | 'delete';
type Subjects = IUser | IPost | IComment | 'Article' | 'Comment' | 'User';

type AppAbility = Ability<[Actions, Subjects]>;
const AppAbility = Ability as AbilityClass<AppAbility>;

type DefinePermissions = (user: IUser, builder: AbilityBuilder<Ability>) => void;

const rolePermissions: Record<Role, DefinePermissions> = {
  member(user, { can, cannot }) {
    can('manage', 'User', { id: user.id });
    can('update', ['Post', 'Comment'], { author_id: user.id });
    can('delete', 'Post', { author_id: user.id });
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

export const defineAbilityFor = (user: IUser): AppAbility => {
  const builder = new AbilityBuilder<AppAbility>(AppAbility);

  rolePermissions[user.role](user, builder);

  return builder.build();
};
