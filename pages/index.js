import { useState } from 'react';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [perPage, setPerPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSearch = async () => {
        const res = await fetch(`/api/search?description=${searchTerm}`);
        const data = await res.json();
        setResults(data.results);
    };

    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        setResults(data.results);
    };

    const handleGeneratePDF = async () => {
        const res = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ labels: results, perPage })
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'etiquetas.pdf';
        a.click();
    };

    return (
        <div>
            <h1>Generador de Etiquetas</h1>
            <input 
                type="text" 
                placeholder="Buscar por descripción" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Buscar</button>
            <br />
            <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={handleFileUpload}>Subir Archivo</button>
            <br />
            <label>Número de etiquetas por página:</label>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
            </select>
            <button onClick={handleGeneratePDF}>Generar PDF</button>
            <div>
                <h2>Resultados</h2>
                <ul>
                    {results.map((item, index) => (
                        <li key={index}>
                            {item.Descripción} - {item.Código}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
