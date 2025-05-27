import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Debug component to test Gemini API in production
export const GeminiDebugTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };
  const testGeminiAPI = useCallback(async () => {
    setLogs([]);
    setApiStatus('unknown');
    
    try {
      addLog('Starting Gemini API test...');
      
      // Check environment variables
      const geminiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
      addLog(`API Key available: ${!!geminiKey}`);
      
      if (!geminiKey) {
        throw new Error('VITE_GOOGLE_GEMINI_API_KEY not found in environment');
      }
      
      addLog(`API Key length: ${geminiKey.length}`);
      addLog(`API Key starts with: ${geminiKey.substring(0, 10)}...`);
      
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(geminiKey);
      addLog('✓ GoogleGenerativeAI initialized');
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      addLog('✓ Model created');
      
      // Test simple text generation
      addLog('Testing text generation...');
      const result = await model.generateContent("Say 'Hello from Gemini!' if you can read this");
      const response = await result.response;
      const text = response.text();
      
      addLog(`✓ API Response: ${text}`);
      addLog('✅ Gemini API test successful!');
      setApiStatus('success');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
      setApiStatus('error');
    }
  }, []);
  useEffect(() => {
    // Auto-run test on component mount
    testGeminiAPI();
  }, [testGeminiAPI]);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: `2px solid ${apiStatus === 'success' ? '#4CAF50' : apiStatus === 'error' ? '#f44336' : '#ccc'}`,
      borderRadius: '8px',
      backgroundColor: apiStatus === 'success' ? '#f8fff8' : apiStatus === 'error' ? '#fff8f8' : '#f9f9f9'
    }}>
      <h3>🔍 Gemini API Debug Test</h3>
      <button onClick={testGeminiAPI} style={{
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '15px'
      }}>
        Run Test
      </button>
      
      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {logs.length > 0 ? logs.join('\n') : 'Click "Run Test" to start debugging...'}
      </div>
    </div>
  );
};

export default GeminiDebugTest;
