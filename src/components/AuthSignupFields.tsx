import type { AppRole } from '../lib/roles';

type AuthSignupFieldsProps = {
  displayName: string;
  isRoleLocked: boolean;
  role: AppRole;
  onDisplayNameChange: (name: string) => void;
  onRoleChange: (role: AppRole) => void;
};

export function AuthSignupFields({
  displayName,
  isRoleLocked,
  role,
  onDisplayNameChange,
  onRoleChange,
}: AuthSignupFieldsProps) {
  return (
    <>
      <input
        type="text"
        placeholder="как тебя зовут"
        value={displayName}
        onChange={(e) => onDisplayNameChange(e.target.value)}
      />
      {isRoleLocked ? (
        <p className="role-pill">Role: {role === 'kid' ? 'Kid' : 'Parent'}</p>
      ) : (
        <div className="role-choice" aria-label="Choose role">
          <button
            className={role === 'kid' ? 'is-active' : ''}
            onClick={() => onRoleChange('kid')}
            type="button"
          >
            Kid
          </button>
          <button
            className={role === 'parent' ? 'is-active' : ''}
            onClick={() => onRoleChange('parent')}
            type="button"
          >
            Parent
          </button>
        </div>
      )}
    </>
  );
}
