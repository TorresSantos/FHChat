import React, { useState } from 'react';
import {
  MessageSquare,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Attendant, Department, Role } from '../../types';

interface AuthScreenProps {
  attendants: Attendant[];
  departments: Department[];
  onLoginSuccess: (attendant: Attendant) => void;
  onRegisterUser: (newAttendant: Omit<Attendant, 'id' | 'activeTicketsCount'>) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  attendants,
  departments,
  onLoginSuccess,
  onRegisterUser
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<Role>('attendant');
  const [regDepartmentId, setRegDepartmentId] = useState(departments[0]?.id || 'dept-geral');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // 1-Click Test Quick Logins
  const handleQuickLogin = (roleType: 'admin' | 'attendant') => {
    const targetEmail = roleType === 'admin' ? 'admin@empresa.com' : 'atendente@empresa.com';
    const found = attendants.find((a) => a.email.toLowerCase() === targetEmail.toLowerCase());
    
    if (found) {
      setLoginEmail(targetEmail);
      setLoginPassword('123456');
      setLoginError('');
      onLoginSuccess(found);
    } else {
      // Fallback if not found by email
      const fallback = attendants.find((a) => a.role === roleType) || attendants[0];
      if (fallback) {
        onLoginSuccess(fallback);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Por favor, informe seu e-mail e senha.');
      return;
    }

    const user = attendants.find(
      (a) => a.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!user) {
      setLoginError('Usuário não encontrado. Verifique o e-mail ou cadastre-se.');
      return;
    }

    // Check password if set, or default validation
    if (user.password && user.password !== loginPassword) {
      setLoginError('Senha incorreta. Tente novamente ou use os atalhos de teste.');
      return;
    }

    onLoginSuccess(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não coincidem.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Check if email already exists
    const exists = attendants.some(
      (a) => a.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (exists) {
      setRegError('Este e-mail já está cadastrado no sistema.');
      return;
    }

    // Avatar random generator based on name
    const newAvatar = `https://images.unsplash.com/photo-${
      regRole === 'admin' ? '1534528741775-53994a69daeb' : '1494790108377-be9c29b29330'
    }?w=150&auto=format&fit=crop&q=80`;

    const newAttendantData = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      departmentId: regDepartmentId,
      status: 'online' as const,
      avatar: newAvatar,
      phone: regPhone.trim() || '+55 11 99999-0000',
      connectionIds: ['conn-1'],
      queueIds: ['queue-1', 'queue-2']
    };

    onRegisterUser(newAttendantData);
    setRegSuccess('Conta criada com sucesso! Acessando a central...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center border-b border-gray-800/80 bg-gradient-to-b from-gray-900/80 to-gray-900/40">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 mb-4">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Central WhatsApp</h1>
          <p className="text-xs text-gray-400 mt-1">
            Plataforma Multiatendimento & Automação com IA
          </p>
        </div>

        {/* Quick Test Login Bar */}
        <div className="bg-emerald-950/30 border-b border-emerald-800/30 p-3.5 px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Contas de Teste Rápido (1-Clique)
            </span>
            <span className="text-[10px] text-emerald-500 font-mono">Senha: 123456</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>👑 Entrar Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('attendant')}
              className="flex items-center justify-center space-x-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>🎧 Entrar Atendente</span>
            </button>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold text-center transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'login'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-gray-800/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar no Sistema</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setRegError('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold text-center transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'register'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-gray-800/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="ex: admin@empresa.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Sua Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-emerald-500 bg-gray-900 border-gray-700 rounded"
                  />
                  <span>Lembrar de mim</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Utilize a senha de teste: 123456'); }} className="text-emerald-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99] mt-2"
              >
                <span>Acessar o Painel Central</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="ex: João Silva"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="joao@empresa.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Senha *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 dígitos"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Repita a senha"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Cargo / Nível
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="attendant">🎧 Atendente</option>
                    <option value="supervisor">📊 Supervisor</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Departamento
                  </label>
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Telefone WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="+55 11 99999-8888"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99] mt-2"
              >
                <span>Criar Minha Conta e Acessar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
