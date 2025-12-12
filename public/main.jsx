window.baseUrl = 'https://imagelabeling.vercel.app';
// Create a simple React component for the demo
function App() {
  const [image, setImage] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [textPrompt, setTextPrompt] = React.useState('');
  const [boxThreshold, setBoxThreshold] = React.useState('0.35');
  const [textThreshold, setTextThreshold] = React.useState('0.25');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Sample image-prompt pairs
  const samplePairs = [
    { id: 1, prompt: "cat", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" },
    { id: 2, prompt: "dog", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400" },
    { id: 3, prompt: "car", image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400" },
    { id: 4, prompt: "person", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" }
  ];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSamplePair = (pair) => {
    setTextPrompt(pair.prompt);
    // In a real app, we would load the actual image file
    // For now, we'll just show the preview
    setPreviewUrl(pair.image);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('text_prompt', textPrompt);
    formData.append('box_threshold', boxThreshold);
    formData.append('text_threshold', textThreshold);

    try {
      const response = await fetch(window.baseUrl + '/label-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to process image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Segment Anything Model
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload an image and describe what you want to detect with AI-powered segmentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Try the Model</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors hover:border-indigo-400">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-gray-500">Drag and drop your image here</p>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 inline-block px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 cursor-pointer transition-opacity"
                  >
                    Select File
                  </label>
                </div>
              </div>

              {/* Text Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe what to detect</label>
                <input
                  type="text"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., red car, person wearing glasses..."
                  required
                />
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Box Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={boxThreshold}
                    onChange={(e) => setBoxThreshold(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={textThreshold}
                    onChange={(e) => setTextThreshold(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Process Image'}
              </button>
            </form>

            {/* Sample Pairs */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Try these examples:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {samplePairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => loadSamplePair(pair)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-transparent group-hover:border-indigo-400 transition-colors">
                      <img
                        src={pair.image}
                        alt={pair.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-sm text-center text-gray-600 group-hover:text-indigo-600">{pair.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Error</h3>
                    <p className="mt-1 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-green-800">Success!</h3>
                      <p className="mt-1 text-sm text-green-700">{result.message}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Detection Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm"><span className="font-medium">Image ID:</span> {result.image_id}</p>
                      <p className="text-sm mt-1"><span className="font-medium">Phrases detected:</span> {result.phrases.join(', ')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Bounding Boxes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(result.boxes, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Confidence Scores</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(result.logits, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {result.labeled_image_url && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Labeled Image</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={result.labeled_image_url}
                          alt="Labeled result"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Processed results will appear here</p>
                <p className="text-sm mt-1">Upload an image and click "Process Image" to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the app to the root-demo container
const container = document.getElementById('root-demo');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  console.warn('Container with id "root-demo" not found');
}