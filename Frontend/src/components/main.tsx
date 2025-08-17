"use client";
import React, { useEffect, useState } from "react";

const Main: React.FC = () => {
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
    } else {
      alert("Please upload a valid file.");
    }
  };

  const generateSummary = async () => {
    if (!transcript) return;
    if (generatedSummary) {
      setGeneratedSummary("");
    }

    const regex = /^[\x20-\x7E\n\r\t]*$/;

    if (!regex.test(transcript)) {
      alert("Transcript contains invalid characters. Please remove them.");
      return;
    }
    if (!regex.test(customPrompt)) {
      alert("Custom prompt contains invalid characters.");
      return;
    }

    setIsGenerating(true);

    const getSummary = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/generate/summary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: transcript,
              prompt: customPrompt || "",
            }),
          }
        );
        const data = await response.json();
        // console.log(data);
        setGeneratedSummary(data.response);
        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating summary:", error);
      }
    };
    setTimeout(() => {
      getSummary();
    }, 5000);
  };

  const shareSummary = async () => {
    const cleaned = emails.map((email) => email.trim()).filter(Boolean);
    if (cleaned.length === 0 || !generatedSummary) {
      alert("Please enter a valid email address and generate a summary first.");
      return;
    }
    // Make API call
    // console.log("Sharing summary with:", cleaned);
    const response = await fetch("http://localhost:8000/api/share/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emails: cleaned,
        summary: generatedSummary,
      }),
    });
    if (
      response.ok &&
      (await response.json()).message === "Summary shared successfully"
    ) {
      // console.log("Summary shared successfully");
      alert(`Summary shared with: ${cleaned.join(", ")}`);
      setShowEmailModal(false);
      setEmails([]);
    } else {
      console.error("Error sharing summary:", response.statusText);
    }
  };

  const addEmailField = () => {
    setEmails((prev) => [...prev, ""]);
  };

  const updateEmail = (index: number, value: string) => {
    setEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  };

  useEffect(() => {
    if (!transcript) {
      setGeneratedSummary("");
    }
  }, [transcript]);

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <h1 className='text-3xl font-bold text-gray-800'>AI Summary Generator</h1>

      {/* File Upload Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-0'>Upload Transcript</h2>
        <span>(Only .txt and .srt files are supported.)</span>
        <input
          type='file'
          accept='.txt,.srt'
          onChange={handleFileUpload}
          className='mb-4 mt-8 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
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
          disabled={!transcript || isGenerating}
          className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {isGenerating ? "Generating..." : "Generate Summary"}
        </button>
        {isGenerating && (
          <p className='text-sm text-gray-500'>
            Please wait while we generate your summary...
          </p>
        )}
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
        <form
          onSubmit={shareSummary}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        >
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
                type='submit'
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
        </form>
      )}
    </div>
  );
};

export default Main;
