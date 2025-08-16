"use client";
import React, { useState } from "react";

interface MainProps {}

const Main: React.FC<MainProps> = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateSummary = async () => {
    if (!transcript || !customPrompt) return;

    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedSummary(
        `Generated summary based on: "${customPrompt}"\n\n${transcript.substring(
          0,
          200
        )}...`
      );
      setIsGenerating(false);
    }, 2000);
  };

  const shareSummary = () => {
    const cleaned = emails.map((email) => email.trim()).filter(Boolean);
    if (cleaned.length === 0 || !generatedSummary) {
      alert("Please enter a valid email address and generate a summary first.");
      return;
    }
    // Simulate email sharing
    alert(`Summary shared with: ${cleaned.join(", ")}`);
    setShowEmailModal(false);
    setEmails([]);
  };

  const addEmailField = () => {
    setEmails((prev) => [...prev, ""]);
  };

  const updateEmail = (index: number, value: string) => {
    setEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <h1 className='text-3xl font-bold text-gray-800'>AI Summary Generator</h1>

      {/* File Upload Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>Upload Transcript</h2>
        <input
          type='file'
          accept='.txt,.doc,.docx'
          onChange={handleFileUpload}
          className='mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
        />
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder='Or paste your transcript here...'
          className='w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      {/* Custom Prompt Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>Custom Instructions</h2>
        <input
          type='text'
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder='e.g., Summarize in bullet points for executives'
          className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      {/* Generate Button */}
      <div className='text-center'>
        <button
          onClick={generateSummary}
          disabled={!transcript || !customPrompt || isGenerating}
          className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {isGenerating ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {/* Generated Summary Section */}
      {generatedSummary && (
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Generated Summary</h2>
          <textarea
            value={generatedSummary}
            onChange={(e) => setGeneratedSummary(e.target.value)}
            className='w-full h-48 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <div className='mt-4 text-right'>
            <button
              onClick={() => setShowEmailModal(true)}
              className='px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700'
            >
              Share via Email
            </button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Share Summary</h3>
            {emails.length === 0 && (
              <p className='text-sm text-gray-500 mb-3'>
                Click + to add recipient email fields.
              </p>
            )}
            <div className='space-y-3 mb-4 max-h-60 overflow-auto pr-1'>
              {emails.map((email, idx) => (
                <input
                  key={idx}
                  type='email'
                  value={email}
                  onChange={(e) => updateEmail(idx, e.target.value)}
                  placeholder={`Recipient ${idx + 1} email`}
                  className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              ))}
            </div>

            <button
              onClick={addEmailField}
              type='button'
              className='px-4 py-2 mb-6 bg-blue-100 text-black font-semibold rounded-md hover:bg-blue-600 hover:text-white transition'
            >
              +
            </button>
            <div className='flex space-x-3'>
              <button
                onClick={shareSummary}
                className='flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700'
              >
                Send
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
