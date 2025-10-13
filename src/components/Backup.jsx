import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Download, KeyRound } from 'lucide-react';

const locahostBackend = import.meta.env.VITE_BACKEND_URL;

export default function Backup() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    const gerarBackup = async () => {
        if (!token) {
            alert('⚠️ Informe o token de autorização.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${locahostBackend}/api/backup`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`, // 👈 aqui está a mudança
                },
            });

            if (!response.ok) {
                throw new Error('Token inválido ou erro no servidor.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_operacoes_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao gerar backup:', err);
            alert('❌ Falha ao gerar backup. Verifique o token.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-6 border rounded-lg shadow-sm bg-white max-w-lg mx-auto space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" /> Backup de Operações
            </h2>
            <p className="text-gray-600">Baixe os dados completos da tabela <b>operacoes</b> em formato JSON.</p>

            <Input
                type="password"
                placeholder="Digite o token de segurança..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="border-gray-300"
            />

            <Button
                onClick={gerarBackup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
                {loading ? 'Gerando...' : (
                    <>
                        <Download className="w-4 h-4 mr-2" /> Gerar Backup
                    </>
                )}
            </Button>
        </div>
    );
}
