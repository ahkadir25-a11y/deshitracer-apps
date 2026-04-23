'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';

export default function ScriptManager() {
  const [headScripts, setHeadScripts] = useState<string[]>([]);
  const [bodyScripts, setBodyScripts] = useState<string[]>([]);
  const [newScript, setNewScript] = useState('');
  const [location, setLocation] = useState<'head' | 'body'>('head');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((data) => {
        setHeadScripts(data?.scripts?.head || []);
        setBodyScripts(data?.scripts?.body || []);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    if (!newScript.trim()) return;
    const update = location === 'head' ? setHeadScripts : setBodyScripts;
    update((prev) => [...prev, newScript.trim()]);
    setNewScript('');
  };

  const handleDelete = async (index: number, from: 'head' | 'body') => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this script? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    const update = from === 'head' ? setHeadScripts : setBodyScripts;
    update((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const config = {
      scripts: {
        head: headScripts,
        body: bodyScripts,
      },
    };

    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config, null, 2),
    });

    alert('✅ Config saved!');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 !cursor-pointer max-w-4xl mr-auto flex flex-col gap-6 text-sm">
      <h1 className="text-xl font-semibold mb-4">Custom Script Manager</h1>

      {/* Script Input */}
      <div className="bg-white border rounded shadow p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1">Script Input</label>
          <textarea
            rows={6}
            value={newScript}
            onChange={(e) => setNewScript(e.target.value)}
            placeholder="Paste your <script> or <noscript> tag here..."
            className="w-full font-mono bg-gray-100 text-sm p-2 border rounded"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Inject into:</span>
          <button
            onClick={() => setLocation('head')}
            className={`px-3 py-1 !cursor-pointer rounded ${location === 'head' ? 'bg-[#222] text-white' : 'bg-gray-200 text-gray-700'
              }`}
          >
            Head
          </button>
          <button
            onClick={() => setLocation('body')}
            className={`px-3 py-1 !cursor-pointer rounded ${location === 'body' ? 'bg-[#222] text-white' : 'bg-gray-200 text-gray-700'
              }`}
          >
            Body
          </button>

          <button
            onClick={handleAdd}
            className="ml-auto !cursor-pointer flex items-center gap-1 px-4 py-1 bg-green-600 text-white rounded"
          >
            <FaPlus /> Add Script
          </button>
        </div>
      </div>

      {/* Head Scripts */}
      <div className="bg-white border rounded shadow p-4">
        <h2 className="font-semibold text-base mb-3">Head Scripts</h2>
        {headScripts.length === 0 ? (
          <p className="text-gray-500">No scripts in head.</p>
        ) : (
          headScripts.map((script, i) => (
            <div key={i} className="flex items-start gap-2 mb-3">
              <pre className="flex-1 !cursor-pointer font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                {script}
              </pre>
              <button
                onClick={() => handleDelete(i, 'head')}
                className="p-2 !cursor-pointer bg-red-600 text-white rounded"
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Body Scripts */}
      <div className="bg-white border rounded shadow p-4">
        <h2 className="font-semibold text-base mb-3">Body Scripts</h2>
        {bodyScripts.length === 0 ? (
          <p className="text-gray-500">No scripts in body.</p>
        ) : (
          bodyScripts.map((script, i) => (
            <div key={i} className="flex items-start gap-2 mb-3">
              <pre className="flex-1 !cursor-pointer font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                {script}
              </pre>
              <button
                onClick={() => handleDelete(i, 'body')}
                className="p-2 !cursor-pointer bg-red-600 text-white rounded"
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Save Button */}
      <div className="text-right">
        <button
          onClick={handleSave}
          className="inline-flex !cursor-pointer items-center gap-2 px-6 py-2 bg-blue-700 text-white font-medium rounded"
        >
          <FaSave /> Save All
        </button>
      </div>


    </div>
  );
}
