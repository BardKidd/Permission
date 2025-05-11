import { defineAbility } from '@casl/ability';

export default function defineAbilityFor(userPermissions = []) {
  return defineAbility((can) => {
    userPermissions.forEach((permission) => {
      switch (permission.level) {
        case 'write':
          can('manage', permission.subject);
          break;
        case 'read':
          can('read', permission.subject);
          break;
      }
    });
  });
}
