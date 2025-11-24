import React, { useEffect, useState } from 'react';
import Recorder from './component/recorder';
import Replay from './component/replay';
import RecordingList, { RecordingMeta } from './component/recordinglist';

const App: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);

  const loadRecordings = () => {
    const meta: RecordingMeta[] = JSON.parse(localStorage.getItem('recordingsMeta') || '[]');
    setRecordings(meta);
  };

  useEffect(() => loadRecordings(), []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ddd', padding: 10 }}>
        <h2>Recordings</h2>
        <RecordingList recordings={recordings} onSelect={setSelectedRecording} />
        <div style={{ marginTop: 20 }}>
          <img src="/898bbd7c-eb42-4919-bb71-83bdc1ca9314.png" alt="Screenshot" style={{ width: '100%' }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: 10 }}>
        {!selectedRecording ? (
          <>
            <h2>Record New Session</h2>
            <Recorder onSave={loadRecordings} />
          </>
        ) : (
          <>
            <h2>Replay Session</h2>
            <Replay recordingId={selectedRecording} />
            <button onClick={() => setSelectedRecording(null)}>Back to list</button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
