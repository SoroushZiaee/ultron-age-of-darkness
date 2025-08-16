'use client';

import { useState } from 'react';

export default function Home() {
  const [autopilotMode, setAutopilotMode] = useState(false);
  const [impactFactor, setImpactFactor] = useState(5);
  const [wordCount, setWordCount] = useState(5000);
  const [studyTypes, setStudyTypes] = useState([
    'Meta-Analysis',
    'Randomized Controlled Trial',
    'Systematic Review',
    'Cohort Study',
    'Case-Control Study'
  ]);
  const [researchTopic, setResearchTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [citationStyle, setCitationStyle] = useState('apa');
  const [includeStatistics, setIncludeStatistics] = useState(false);
  const [generateFigures, setGenerateFigures] = useState(false);
  const [addSupplementary, setAddSupplementary] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const newStudyTypes = [...studyTypes];
      const draggedItem = newStudyTypes[dragIndex];
      newStudyTypes.splice(dragIndex, 1);
      newStudyTypes.splice(dropIndex, 0, draggedItem);
      setStudyTypes(newStudyTypes);
    }
  };

  const generateArticleJSON = () => {
    const articleData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        generator: 'Scientific Article Generator'
      },
      coreDetails: {
        researchTopic: researchTopic,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      },
      sourceEvidence: {
        minimumImpactFactor: impactFactor,
        studyTypePriority: studyTypes
      },
      structureFormatting: {
        wordCount: wordCount,
        citationStyle: citationStyle
      },
      aiSettings: {
        mode: autopilotMode ? 'autopilot' : 'expert_review',
        additionalOptions: {
          includeStatisticalAnalysis: includeStatistics,
          generateFiguresAndCharts: generateFigures,
          addSupplementaryMaterials: addSupplementary
        }
      }
    };

    const jsonString = JSON.stringify(articleData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scientific-article-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Scientific Article Generator
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Advanced AI-Powered Research Article Creation System</p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          
          {/* Core Article Details */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-white">Core Article Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">Research Topic</label>
                <input
                  type="text"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="Enter your research topic..."
                />
              </div>
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">Keywords</label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                  rows={3}
                  placeholder="Enter keywords separated by commas..."
                />
              </div>
            </div>
          </div>

          {/* Source & Evidence Criteria */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-white">Source & Evidence Criteria</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">
                  Minimum Impact Factor: <span className="text-cyan-400 font-bold">{impactFactor}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={impactFactor}
                  onChange={(e) => setImpactFactor(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #0EA5E9 0%, #0EA5E9 ${impactFactor * 10}%, #374151 ${impactFactor * 10}%, #374151 100%)`
                  }}
                />
              </div>
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">Study Type Priority (Drag to reorder)</label>
                <div className="space-y-2">
                  {studyTypes.map((type, index) => (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="px-4 py-2 bg-black/50 border border-blue-500/30 rounded-lg text-white cursor-move hover:border-blue-400 transition-all flex items-center"
                    >
                      <span className="text-blue-400 mr-3">☰</span>
                      <span className="text-sm">{index + 1}. {type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Structure & Formatting */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-white">Structure & Formatting</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">
                  Word Count: <span className="text-cyan-400 font-bold">{wordCount.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #0EA5E9 0%, #0EA5E9 ${((wordCount - 1000) / 9000) * 100}%, #374151 ${((wordCount - 1000) / 9000) * 100}%, #374151 100%)`
                  }}
                />
              </div>
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">Citation Style</label>
                <select 
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all">
                  <option value="apa">APA 7th Edition</option>
                  <option value="mla">MLA 9th Edition</option>
                  <option value="chicago">Chicago Manual of Style</option>
                  <option value="harvard">Harvard</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="ieee">IEEE</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Generation Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-white">AI Generation Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <label className="block text-blue-400 text-sm font-medium mb-3">Generation Mode</label>
                <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setAutopilotMode(false)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      !autopilotMode 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">🔬</span> Expert Review Mode
                  </button>
                  <button
                    onClick={() => setAutopilotMode(true)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                      autopilotMode 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">🚀</span> Autopilot Mode
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-400">
                  {autopilotMode 
                    ? "AI will automatically generate and optimize the entire article" 
                    : "Review and approve each section before proceeding"}
                </p>
              </div>
              
              <div>
                <label className="block text-blue-400 text-sm font-medium mb-2">Additional Settings</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeStatistics}
                      onChange={(e) => setIncludeStatistics(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2" 
                    />
                    <span className="text-sm text-gray-300">Include statistical analysis</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={generateFigures}
                      onChange={(e) => setGenerateFigures(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2" 
                    />
                    <span className="text-sm text-gray-300">Generate figures and charts</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={addSupplementary}
                      onChange={(e) => setAddSupplementary(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2" 
                    />
                    <span className="text-sm text-gray-300">Add supplementary materials</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={generateArticleJSON}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300">
            Generate Scientific Article
          </button>
        </div>
      </div>
    </div>
  );
}