import React, { useEffect, useState } from 'react';
import * as rrweb from 'rrweb';
import { EventType } from 'rrweb';

interface RecorderProps {
  onSave?: () => void;
}

const Recorder: React.FC<RecorderProps> = ({ onSave }) => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    const stop = rrweb.record({
      emit(event: EventType) {
        setEvents(prev => [...prev, event]);
      },
    });
    setStopFn(() => stop);
    return () => {
      if (stop) stop();
    };
  }, []);

  const saveRecording = () => {
    if (!events.length) {
      alert('No events recorded!');
      return;
    }

    const id = Date.now().toString();
    localStorage.setItem(`session_${id}`, JSON.stringify(events));

    const meta = {
      id,
      url: window.location.href,
      browser: navigator.userAgent,
      resolution: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: Date.now(),
    };

    const recordingsMeta = JSON.parse(localStorage.getItem('recordingsMeta') || '[]');
    localStorage.setItem('recordingsMeta', JSON.stringify([meta, ...recordingsMeta]));

    if (onSave) onSave();
    alert('Recording saved successfully!');
  };

  return (
    <div>
      <button onClick={saveRecording}>Save Recording</button>
      <button onClick={() => stopFn && stopFn()}>Stop Recording</button>
    </div>
  );
};

export default Recorder;
