import React from 'react';

// export default function InputDatetimeLocal({ label, value, onChange, name }) {
//     // Converte string ISO para o formato aceito pelo input date: "YYYY-MM-DD"
//     const formatDate = (isoDate) => {
//         if (!isoDate) return '';
//         try {
//             return new Date(isoDate).toISOString().slice(0, 10); // apenas data
//         } catch (err) {
//             console.warn("Data inválida:", isoDate);
//             return '';
//         }
//     };

//     return (
//         <div className="flex flex-col gap-1 mb-4">
//             {label && <label className="text-sm font-medium">{label}</label>}
//             <input
//                 type="date"
//                 name={name}
//                 value={formatDate(value)}
//                 onChange={onChange}
//                 className="border rounded px-3 py-2 text-sm shadow-sm"
//             />
//         </div>
//     );
// }

export default function InputDatetimeLocal({ label, value, onChange, name }) {
    // Formata valor inicial para exibição no input (sem segundos/milisegundos)
    const formatForInput = (isoDate) => {
        if (!isoDate) return '';
        try {
            // const date = new Date(isoDate);
            // const tzOffset = date.getTimezoneOffset() * 60000;
            // const localISO = new Date(date - tzOffset).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
            // return localISO;
            return isoDate.split('T')[0]; // 'YYYY-MM-DD'
        } catch (err) {
            console.warn("Data inválida:", isoDate);
            return '';
        }
    };

    // Transforma valor do input (datetime-local) em ISO-8601 completo com segundos/milisegundos
    const handleChange = (e) => {
        const dateStr = e.target.value; // 'YYYY-MM-DD'
        // const localValue = e.target.value; // "YYYY-MM-DDTHH:MM"
        // const isoDate = new Date(localValue).toISOString(); // "YYYY-MM-DDTHH:MM:SS.000Z"
        // onChange({ target: { name, value: isoDate } });
        if (!dateStr) {
            onChange({ target: { name, value: '' } });
            return;
        }
        const [y, m, d] = dateStr.split('-').map(Number);
        const iso = new Date(Date.UTC(y, m - 1, d)).toISOString(); // 'YYYY-MM-DDT00:00:00.000Z'
        onChange({ target: { name, value: iso } });
    };

    return (
        <div className="flex flex-col gap-1 mb-4">
            {label && <label className="text-sm font-medium">{label}</label>}
            <input
                type="date"
                name={name}
                value={formatForInput(value)}
                onChange={handleChange}
                className="border rounded px-3 py-2 text-sm shadow-sm"
            />
        </div>
    );
}



// ------------------------

// export function InputTimeLocal({ label, value, onChange, name }) {
//     // Formata o valor ISO-8601 recebido para mostrar só "HH:mm" no input
//     const formatTime = (isoTime) => {
//         if (!isoTime) return '';
//         try {
//             return new Date(isoTime).toISOString().slice(11, 16); // HH:mm
//         } catch (err) {
//             console.warn("Hora inválida:", isoTime);
//             return '';
//         }
//     };

//     // Quando o usuário muda a hora no input
//     const handleTimeChange = (e) => {
//         const time = e.target.value; // exemplo: "18:30"

//         if (!time) {
//             onChange({ target: { name, value: '' } });
//             return;
//         }

//         try {
//             // Usa a data original ou hoje, mas substitui o horário
//             const baseDate = value ? new Date(value) : new Date();

//             const [hours, minutes] = time.split(':').map(Number);
//             baseDate.setHours(hours);
//             baseDate.setMinutes(minutes);
//             baseDate.setSeconds(0);
//             baseDate.setMilliseconds(0);

//             const isoString = baseDate.toISOString(); // ← aqui gera o ISO-8601 completo
//             onChange({ target: { name, value: isoString } });
//         } catch (err) {
//             console.warn("Erro ao formatar horário:", err);
//         }
//     };

//     return (
//         <div className="flex flex-col gap-1 mb-4">
//             {label && <label className="text-sm font-medium">{label}</label>}
//             <input
//                 type="time"
//                 name={name}
//                 value={formatTime(value)}
//                 onChange={handleTimeChange}
//                 className="border rounded px-3 py-2 text-sm shadow-sm"
//             />
//         </div>
//     );
// }


export function InputTimeLocal({ label, value, onChange, name }) {
    // Mostra só HH:mm no input
    const formatTime = (isoTime) => {
        if (!isoTime) return "";
        try {
            const d = new Date(isoTime);
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}`;
        } catch {
            return "";
        }
    };

    // Monta ISO-8601 preservando fuso horário de São Paulo
    const handleTimeChange = (e) => {
        const time = e.target.value; // ex: "15:00"
        if (!time) {
            onChange({ target: { name, value: "" } });
            return;
        }

        const [hours, minutes] = time.split(":").map(Number);
        const base = value ? new Date(value) : new Date();

        // monta data local
        const year = base.getFullYear();
        const month = String(base.getMonth() + 1).padStart(2, "0");
        const day = String(base.getDate()).padStart(2, "0");

        // gera string ISO-8601 com fuso de São Paulo
        const localIso = `${year}-${month}-${day}T${String(hours).padStart(
            2,
            "0"
        )}:${String(minutes).padStart(2, "0")}:00-03:00`;

        onChange({ target: { name, value: localIso } });
    };

    return (
        <div className="flex flex-col gap-1 mb-4">
            {label && <label className="text-sm font-medium">{label}</label>}
            <input
                type="time"
                name={name}
                value={formatTime(value)}
                onChange={handleTimeChange}
                className="border rounded px-3 py-2 text-sm shadow-sm"
            />
        </div>
    );
}
