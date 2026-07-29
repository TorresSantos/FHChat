import React, { useState } from 'react';
import { Settings, Save, Server, Key, Globe } from 'lucide-react';

export const EvolutionSettings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('https://api.evolution.exemplo.com');
  const [apiKey, setApiKey] = useState('42983749283749823749283');
  const [instanceName, setInstanceName] = useState('FHChatMain');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            Configuração da API Externa / Evolution API REST
          </h2>
          <p className="text-xs text-gray-400">
            Se você utilizar a Evolution API em um servidor VPS externo, insira a URL do endpoint e apikey abaixo.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">URL do Servidor Evolution API</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Global API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-medium">Nome da Instância</label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              onClick={() => alert('Configurações salvas com sucesso!')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Parâmetros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
