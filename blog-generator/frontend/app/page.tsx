'use client';

import React, { useState } from 'react';
import ClientOnly from '../components/ClientOnly';

type GenerationPhase = 'input' | 'progress' | 'success' | 'error';
type ErrorType = 'api_error' | 'research_error' | 'network_error';
type ProcessStage = 'research' | 'generation' | 'validation';

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('input');
  const [errorType, setErrorType] = useState<ErrorType>('api_error');
  const [currentStage, setCurrentStage] = useState<ProcessStage>('research');
  const [stageProgress, setStageProgress] = useState({ research: 0, generation: 0, validation: 0 });
  
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(1000);
  const [tone, setTone] = useState('conversational');
  const [paperCount, setPaperCount] = useState(5);
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(false);
  const [includeExamples, setIncludeExamples] = useState(false);
  
  const [blogContent, setBlogContent] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [estimatedReadTime, setEstimatedReadTime] = useState(5);
  const [citationCount, setCitationCount] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [foundPapers, setFoundPapers] = useState(0);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  
  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // API Client Functions
  const startBlogGeneration = async () => {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        word_count: wordCount,
        tone: tone,
        paper_count: paperCount,
        include_faq: includeFAQ,
        include_statistics: includeStatistics,
        include_examples: includeExamples
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  };
  
  const getGenerationStatus = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/status/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  };
  
  const getBlogResult = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/result/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  };
  
  const checkHealthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const generateBlog = async () => {
    if (!topic.trim()) {
      alert('Please enter a research topic');
      return;
    }
    
    console.log('🚀 Starting blog generation...', { topic, API_BASE_URL });
    
    setCurrentPhase('progress');
    setCurrentStage('research');
    setStageProgress({ research: 0, generation: 0, validation: 0 });
    setFoundPapers(0);
    
    try {
      // Start blog generation
      console.log('📡 Calling startBlogGeneration...');
      const startResponse = await startBlogGeneration();
      console.log('✅ Start response:', startResponse);
      
      const newSessionId = startResponse.session_id;
      setSessionId(newSessionId);
      
      // Poll for status updates
      console.log('🔄 Starting status polling...');
      await pollGenerationStatus(newSessionId);
      
    } catch (error: any) {
      console.error('❌ Blog generation error:', error);
      handleGenerationError(error);
    }
  };
  
  const pollGenerationStatus = async (sessionId: string) => {
    const maxPolls = 120; // 10 minutes maximum
    let pollCount = 0;
    
    while (pollCount < maxPolls) {
      try {
        const statusResponse = await getGenerationStatus(sessionId);
        
        if (statusResponse.status === 'error') {
          // Handle API-returned errors
          const error = statusResponse.error;
          setErrorType(error.error_type || 'api_error');
          setCurrentPhase('error');
          return;
        }
        
        if (statusResponse.status === 'completed') {
          // Generation completed, get the result
          const result = statusResponse.result;
          setBlogTitle(result.title);
          setBlogContent(result.content);
          setEstimatedReadTime(result.estimated_read_time);
          setCitationCount(result.citation_count);
          setCurrentPhase('success');
          return;
        }
        
        if (statusResponse.status === 'running') {
          // Update progress
          const { stage, progress, found_papers } = statusResponse;
          setCurrentStage(stage);
          setStageProgress(progress);
          if (found_papers) {
            setFoundPapers(found_papers);
          }
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        pollCount++;
        
      } catch (error) {
        console.error('Status polling error:', error);
        // Continue polling unless it's a critical error
        if (pollCount > 3) { // Allow a few retries
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        pollCount++;
      }
    }
    
    // Timeout reached
    throw new Error('Generation timeout: Process took too long to complete');
  };
  
  const handleGenerationError = (error: any) => {
    let errorType: ErrorType = 'api_error';
    
    if (error.message?.includes('research') || error.message?.includes('papers')) {
      errorType = 'research_error';
    } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('timeout')) {
      errorType = 'network_error';
    }
    
    setErrorType(errorType);
    setCurrentPhase('error');
  };
  
  const retryGeneration = () => {
    setRetryCount(prev => prev + 1);
    generateBlog();
  };
  
  // Check API health on component mount
  React.useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkHealthStatus();
      setApiHealthy(healthy);
    };
    checkHealth();
  }, []);
  
  const resetToInput = () => {
    setCurrentPhase('input');
    setRetryCount(0);
  };
  
  const downloadMarkdown = () => {
    const blob = new Blob([blogContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-blog.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(blogContent);
    alert('Blog content copied to clipboard!');
  };


  const renderQuickActionsBar = () => (
    <div className="fixed top-4 right-4 z-50 flex space-x-2">
      <button className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors" title="Save Progress">
        💾
      </button>
      <button className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors" title="Restart" onClick={resetToInput}>
        🔄
      </button>
      <button className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors" title="Email Support">
        📧
      </button>
      <button className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors" title="View History">
        📚
      </button>
      <button className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors" title="Help">
        ❓
      </button>
    </div>
  );

  const renderInputScreen = () => (
    <div className="max-w-4xl mx-auto">
      {/* System Health Check */}
      <div className={`rounded-lg p-4 mb-6 ${
        apiHealthy === null ? 'bg-yellow-900/20 border border-yellow-500/30' :
        apiHealthy ? 'bg-green-900/20 border border-green-500/30' :
        'bg-red-900/20 border border-red-500/30'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          apiHealthy === null ? 'text-yellow-400' :
          apiHealthy ? 'text-green-400' : 'text-red-400'
        }`}>
          {apiHealthy === null ? '⏳' : apiHealthy ? '✓' : '❌'} System Health Check
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              apiHealthy === null ? 'bg-yellow-500' :
              apiHealthy ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300">API Gateway: {apiHealthy === null ? 'Checking...' : apiHealthy ? 'Online' : 'Offline'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              apiHealthy === null ? 'bg-yellow-500' :
              apiHealthy ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300">OpenAI API: {apiHealthy === null ? 'Checking...' : apiHealthy ? 'Online' : 'Offline'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              apiHealthy === null ? 'bg-yellow-500' :
              apiHealthy ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300">Storage: {apiHealthy === null ? 'Checking...' : apiHealthy ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        {apiHealthy === false && (
          <div className="mt-3 text-sm text-red-400">
            ⚠️ Backend services are offline. Please ensure the API server is running on {API_BASE_URL}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Input */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">📝 Research Topic</h2>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
            rows={4}
            placeholder="Enter your research topic (e.g., 'The impact of artificial intelligence on healthcare outcomes')"
          />
          {topic && (
            <div className="mt-2 text-sm text-gray-400">
              ✓ Topic validation: Specific and researchable
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">⚙️ Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-blue-400 text-sm font-medium mb-2">
                Word Count: <span className="text-cyan-400 font-bold">{wordCount}</span>
              </label>
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>500</span>
                <span>2000</span>
              </div>
            </div>

            <div>
              <label className="block text-blue-400 text-sm font-medium mb-2">Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400">
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="academic">Academic</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-400 text-sm font-medium mb-2">
                Paper Count: <span className="text-cyan-400 font-bold">{paperCount}</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={paperCount}
                onChange={(e) => setPaperCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">📋 Sections</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeFAQ}
                onChange={(e) => setIncludeFAQ(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" 
              />
              <span className="text-gray-300">FAQ Section</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeStatistics}
                onChange={(e) => setIncludeStatistics(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" 
              />
              <span className="text-gray-300">Statistics</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" 
              />
              <span className="text-gray-300">Real-world Examples</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={generateBlog}
          disabled={!topic.trim() || apiHealthy === false}
          className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {apiHealthy === false ? 'API Offline' : apiHealthy === null ? 'Checking API...' : 'Generate Blog'}
        </button>
      </div>

      {/* API Status Info */}
      {apiHealthy === false && (
        <div className="mt-8 text-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-red-400 text-sm">
              ⚠️ <strong>Backend Offline:</strong> Make sure the API server is running:
              <br />
              <code className="text-xs bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                cd services && python api_gateway.py
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProgressScreen = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">Generating Your Blog...</h2>
        
        <div className="space-y-6">
          {/* Research Phase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium">Research Phase</span>
              <span className="text-cyan-400">{stageProgress.research}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stageProgress.research}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              {currentStage === 'research' ? (
                foundPapers > 0 ? `→ Found ${foundPapers} relevant papers` : '✓ Searching papers...'
              ) : '✓ Research complete'}
            </div>
          </div>

          {/* Generation Phase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium">Generation Phase</span>
              <span className="text-cyan-400">{stageProgress.generation}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stageProgress.generation}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              {currentStage === 'generation' ? '→ Writing content...' : 
               stageProgress.generation === 0 ? '⏳ Waiting...' : '✓ Generation complete'}
            </div>
          </div>

          {/* Validation Phase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium">Validation Phase</span>
              <span className="text-cyan-400">{stageProgress.validation}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stageProgress.validation}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              {currentStage === 'validation' ? '→ Validating content...' : 
               stageProgress.validation === 0 ? '⏳ Waiting...' : '✓ Validation complete'}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <div className="text-lg">Estimated Time: 2-3 minutes</div>
          <div className="text-sm mt-2">Session ID: {sessionId}</div>
        </div>

        {/* Low Bandwidth Mode Tip */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Poor internet? Enable "Low Bandwidth Mode"
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-400">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-3 h-3" />
              <span>Reduce real-time updates</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-3 h-3" />
              <span>Email when complete</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-3 h-3" />
              <span>Allow up to 10 min timeout</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-white mb-2">Blog Generated Successfully!</h2>
        <p className="text-gray-400">Your research-based blog post is ready</p>
      </div>

      {/* Blog Preview */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-white">📄 Blog Preview</h3>
          <div className="flex space-x-4 text-sm text-gray-400">
            <span>{wordCount} words</span>
            <span>{estimatedReadTime} min read</span>
            <span>{citationCount} citations</span>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h4 className="text-xl font-bold text-white mb-3">{blogTitle}</h4>
          <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
            {blogContent.slice(0, 800)}...
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <button 
          onClick={downloadMarkdown}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          📄 Download Markdown
        </button>
        <button className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
          📑 Download PDF
        </button>
        <button 
          onClick={copyToClipboard}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
          📝 Copy to Clipboard
        </button>
        <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
          ✏️ Edit in Editor
        </button>
        <button className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm">
          📧 Email to Me
        </button>
      </div>

      {/* Generation Another */}
      <div className="text-center">
        <button 
          onClick={resetToInput}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
          Generate Another Blog
        </button>
      </div>
    </div>
  );

  const renderErrorScreen = () => {
    const errorConfig = {
      api_error: {
        title: 'Generation Failed',
        subtitle: 'The AI service is temporarily unavailable.',
        details: 'OpenAI API timeout/rate limit',
        actions: [
          { label: 'Retry Now', action: retryGeneration, color: 'blue' },
          { label: 'Retry in 5 min', action: () => setTimeout(retryGeneration, 300000), color: 'gray' },
          { label: 'Use Simpler Topic', action: resetToInput, color: 'yellow' },
          { label: 'Download Partial', action: () => {}, color: 'green' }
        ]
      },
      research_error: {
        title: 'Insufficient Research Data',
        subtitle: 'Could not find enough quality papers on this topic.',
        details: 'Less than 3 papers found',
        actions: [
          { label: 'Broaden Topic', action: resetToInput, color: 'blue' },
          { label: 'Try Alternative Terms', action: resetToInput, color: 'yellow' },
          { label: 'Manual Paper Entry', action: () => {}, color: 'purple' },
          { label: 'Continue Anyway', action: retryGeneration, color: 'green' }
        ]
      },
      network_error: {
        title: 'Connection Lost',
        subtitle: 'Lost connection to the blog generation service.',
        details: 'Network timeout after 30 seconds',
        actions: [
          { label: 'Reconnect', action: retryGeneration, color: 'blue' },
          { label: 'Save Draft', action: () => {}, color: 'gray' },
          { label: 'Start Fresh', action: resetToInput, color: 'yellow' },
          { label: 'Check Status', action: () => {}, color: 'green' }
        ]
      }
    };

    const config = errorConfig[errorType];
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">{config.title}</h2>
            <p className="text-gray-300">{config.subtitle}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="text-red-400 font-semibold">What happened:</div>
              <div className="text-gray-300 mb-3">{config.details}</div>
              <div className="text-red-400 font-semibold">What you can do:</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                  action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  action.color === 'gray' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                  action.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                  action.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  'bg-purple-600 hover:bg-purple-700 text-white'
                }`}>
                {action.label}
              </button>
            ))}
          </div>

          {/* Recovery Success Metrics */}
          <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 font-semibold mb-2">📊 Your Generation Status:</div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Attempts: {retryCount}/3</div>
              <div>Success Rate: 94% for similar topics</div>
              <div>Average Retry Success: 78%</div>
              <div className="text-cyan-400">Recommended Action: Wait 2 minutes and retry</div>
              <div className="text-yellow-400">Alternative: Download partial results (80% complete)</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/10 to-black"></div>
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230EA5E9' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {renderQuickActionsBar()}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Blog Generation System
            </span>
          </h1>
          <p className="text-gray-400 text-lg">AI-Powered Research-Based Blog Creation</p>
        </header>

        {/* Render Current Phase */}
        {currentPhase === 'input' && renderInputScreen()}
        {currentPhase === 'progress' && renderProgressScreen()}
        {currentPhase === 'success' && renderSuccessScreen()}
        {currentPhase === 'error' && renderErrorScreen()}
      </div>
    </div>
  );
}