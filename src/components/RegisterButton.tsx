import { Link } from 'wouter';
import './RegisterButton.css';

type RegisterButtonProps = {
  label: string;
};

export function RegisterButton({ label }: RegisterButtonProps) {
  return (
    <Link className="register-button" href="/register">
      {label}
    </Link>
  );
}
