import './header.css';

const LoginHeader = ({ isAdmin }) => { 
  return (
    <div className={`header ${!isAdmin ? 'guest' : ''}`}>
      <img className="resortlogo" src="/logo.png" alt="logo" />
    </div>
  );
};

export default LoginHeader;