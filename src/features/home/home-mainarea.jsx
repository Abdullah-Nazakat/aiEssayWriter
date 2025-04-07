'use client'
import React, { useState, useRef, useEffect } from 'react';
// import RichTextEditor from '@/components/richeditor';
import { FiCopy, FiTrash2, FiDownload, FiChevronDown } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const HomeMainarea = () => {
  // Form states
  const [formData, setFormData] = useState({
    topic: '',
    academicLevel: '',
    description: '',
    wordCount: 1000
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const richTextEditorRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'wordCount' ? Math.max(100, parseInt(value) || 100) : value
    }));
  };

  // Check if form is valid for submission
  const isFormValid = formData.topic && formData.academicLevel;

  // Generate essay content
  const generateEssay = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating your essay...');
    
    try {
      const generatedContent = await generateAIContent({
        topic: formData.topic,
        academicLevel: formData.academicLevel,
        description: formData.description,
        wordCount: formData.wordCount
      });
      
      if (richTextEditorRef.current) {
        richTextEditorRef.current.setContent(generatedContent);
        setEditorContent(generatedContent);
        setHasGeneratedContent(true);
      }
      toast.success('Essay generated successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Error generating essay:", error);
      toast.error('Failed to generate essay', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock AI content generation
  const generateAIContent = async (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { topic, academicLevel, description, wordCount } = params;
        const intro = `<h2>${topic}</h2><p>This ${wordCount}-word essay discusses ${topic} at the ${academicLevel} level. `;
        const body = description 
          ? `Specifically, it will examine ${description}. `
          : 'The topic will be explored in depth. ';
        const conclusion = `This essay provides comprehensive analysis within the requested ${wordCount} words.</p>`;
        
        resolve(`${intro}${body}${conclusion}<p>Additional content would appear here with proper formatting.</p>`);
      }, 1500);
    });
  };

  // Editor actions
  const handleCopyContent = () => {
    if (!hasGeneratedContent) {
      toast.error('No content to copy');
      return;
    }
    navigator.clipboard.writeText(editorContent.replace(/<[^>]*>/g, ''));
    toast.success('Content copied to clipboard!');
  };

  const handleClearContent = () => {
    if (richTextEditorRef.current) {
      richTextEditorRef.current.setContent('');
      setEditorContent('');
      setHasGeneratedContent(false);
      toast.success('Editor cleared');
    }
  };

  const handleExport = (format) => {
    if (!hasGeneratedContent) {
      toast.error('No content to export');
      return;
    }
    
    const loadingToast = toast.loading(`Exporting as ${format.toUpperCase()}...`);
    setShowExportDropdown(false);
    
    try {
      let blob, filename, mimeType;
      const plainTextContent = editorContent.replace(/<[^>]*>/g, '');
      
     
      const currentDate = new Date().toISOString().split('T')[0]; 
      const topicPart = formData.topic 
        ? formData.topic.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30) 
        : 'essay';
      const baseFilename = `${topicPart}_${currentDate}`;

      switch (format) {
        case 'pdf':
          filename = `${baseFilename}.pdf`;
          const doc = new jsPDF();
          const lines = doc.splitTextToSize(plainTextContent, 180);
          doc.text(lines, 10, 10);
          doc.save(filename);
          break;
          
        case 'doc':
          filename = `${baseFilename}.doc`;
          mimeType = 'application/msword';
          const docContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
              <head>
                <meta charset="UTF-8">
                <title>${formData.topic || 'Essay'}</title>
              </head>
              <body>${editorContent}</body>
            </html>
          `;
          blob = new Blob(['\uFEFF' + docContent], { type: mimeType });
          break;
          
        case 'txt':
          filename = `${baseFilename}.txt`;
          mimeType = 'text/plain';
          blob = new Blob([plainTextContent], { type: mimeType });
          break;
          
        default:
          throw new Error('Unsupported format');
      }
      
      if (format !== 'pdf') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      toast.success(`Exported as ${format.toUpperCase()} successfully!`, { id: loadingToast });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`, { id: loadingToast });
    }
  };

  // Calculate word count
  const calculateWordCount = () => {
    if (!editorContent) return 0;
    const text = editorContent.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <Toaster position="top-center" />
      
      <div className='flex justify-center flex-col items-center mb-8'>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">AI Essay Writer</h1>
        <p className="text-gray-600 text-center max-w-md">
          Generate high-quality essays with AI by filling out the form below
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Input Form Section */}
        <div className="w-full lg:w-[40%] space-y-6 lg:space-y-16">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Essay Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter your essay topic..."
            />
          </div>

          {/* Academic Level */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Academic Level <span className="text-red-500">*</span>
            </label>
            <select
              name="academicLevel"
              value={formData.academicLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="" disabled>Select academic level</option>
              <option value="high-school">High School</option>
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="masters">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          {/* Word Count */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Word Count
            </label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setFormData(prev => ({
                  ...prev,
                  wordCount: Math.max(100, prev.wordCount - 100)
                }))}
                disabled={formData.wordCount <= 100}
                className={`px-4 py-2 rounded-lg border ${
                  formData.wordCount <= 100 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:bg-gray-50'
                } transition`}
              >
                -100
              </button>
              <input
                type="number"
                name="wordCount"
                value={formData.wordCount}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center transition"
                min="100"
              />
              <button 
                onClick={() => setFormData(prev => ({
                  ...prev,
                  wordCount: prev.wordCount + 100
                }))}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
              >
                +100
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              Additional Details (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Add any specific requirements or details..."
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateEssay}
            disabled={!isFormValid || isGenerating}
            className={`w-full py-3 px-6 rounded-lg font-medium text-black transition-all cursor-pointer ${
              !isFormValid || isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[var(--gradient-1)] via-[var(--gradient-2)] to-[var(--gradient-3)] bg-[length:300%_300%] animate-gradient-move'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Essay'
            )}
          </button>
        </div>

        {/* Editor Section */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
            {/* <RichTextEditor ref={richTextEditorRef} className="flex-1" /> */}
            
            {/* Editor Controls - Only shown when content has been generated */}
            {hasGeneratedContent && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 flex justify-between items-center z-50">
                <div className="text-sm text-gray-500">
                  Word count: {calculateWordCount()}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-blue-600 transition cursor-pointer rounded hover:bg-gray-100"
                    title="Copy to clipboard"
                  >
                    <FiCopy className="text-sm" />
                    <span className="text-sm">Copy</span>
                  </button>
                  
                  <button
                    onClick={handleClearContent}
                    className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-red-600 transition rounded cursor-pointer hover:bg-gray-100"
                    title="Clear editor"
                  >
                    <FiTrash2 className="text-sm" />
                    <span className="text-sm">Clear</span>
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-green-600 transition rounded hover:bg-gray-100"
                      title="Export options"
                    >
                      <FiDownload className="text-sm" />
                      <span className="text-sm">Export</span>
                      <FiChevronDown className={`text-xs transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showExportDropdown && (
                      <div className="absolute right-0 bottom-10 w-40 bg-white rounded-md shadow-lg py-1 z-80 border border-gray-200">
                        <button
                          onClick={() => handleExport('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          PDF Document
                        </button>
                        <button
                          onClick={() => handleExport('doc')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          Word Document
                        </button>
                        <button
                          onClick={() => handleExport('txt')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          Plain Text
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMainarea;