import { useState } from "react";
import axios from "axios";
import { Upload, Download } from "lucide-react";

const locahostBackend = import.meta.env.VITE_BACKEND_URL;

export default function RestoreOperacoes() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRestore = async () => {
        if (!file) {
            setStatus("Selecione um arquivo .zip primeiro.");
            return;
        }

        try {
            setLoading(true);
            setStatus("Enviando arquivo...");

            const formData = new FormData();
            formData.append("backupFile", file);

            const res = await axios.post(`${locahostBackend}/api/restore`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStatus(res.data.message || "Banco restaurado com sucesso!");
        } catch (err) {
            console.error("Erro ao restaurar banco:", err);
            setStatus("❌ Falha ao restaurar o banco.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
                <Upload className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                    Restauração de Operações
                </h2>
            </div>

            <p className="text-gray-600 text-sm mb-6">
                Selecione o arquivo <strong>.zip</strong> contendo o backup para
                restaurar a tabela <strong>operacoes</strong>.
            </p>

            <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <button
                onClick={handleRestore}
                disabled={loading}
                className={`w-full mt-5 flex justify-center items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition ${loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                <Download size={18} />
                {loading ? "Restaurando..." : "Restaurar Banco"}
            </button>

            {status && (
                <p
                    className={`mt-4 text-sm ${status.startsWith("❌")
                            ? "text-red-600"
                            : "text-green-600 font-medium"
                        }`}
                >
                    {status}
                </p>
            )}
        </div>
    );
}
