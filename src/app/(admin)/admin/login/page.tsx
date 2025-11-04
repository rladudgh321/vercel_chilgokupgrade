import LoginForm from './LoginForm';
import './login.css';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>관리자 로그인</h1>
        <LoginForm />
      </div>
    </div>
  );
}
