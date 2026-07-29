import React, { useState } from 'react';
import { LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import { Attendant } from '../../types';

interface AuthScreenProps {
  onLogin: (email: string, password?: string) => void;
  attendants: Attendant[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, attendants }) => {
  const [email, setEmail] = useState('torres@fhchat.com');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-emerald-900/40 mx-auto">
            FH
          </div>
          <h2 className="text-xl font-bold text-gray-100">FHChat Central WhatsApp</h2>
          <p className="text-xs text-gray-400">Entrar no Painel Multi-Atendimento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Email do Atendente</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrar na Central
          </button>
        </form>

        <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-500 text-center">
          <strong>Atendentes cadastrados:</strong>
          <div className="flex flex-wrap gap-1.5 justify-center mt-2">
            {attendants.map((a) => (
              <button
                key={a.id}
                onClick={() => setEmail(a.email)}
                className="bg-gray-950 hover:bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-800 transition-all"
              >
                {a.name} ({a.role})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
