import OCRUploader from './components/OCRUploader';

function App() {
  // Suppress console logs in production
  if (import.meta.env.VITE_ENV === 'production' || import.meta.env.VITE_ENV === 'development')
    console.log = console.warn = console.error = () => { };

  return (
    <div className="App">
      <OCRUploader />
    </div>
  );
}

export default App;
