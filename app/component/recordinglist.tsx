import React from 'react';

export interface RecordingMeta {
  id: string;
  url: string;
  browser: string;
  resolution: string;
  timestamp: number;
}

interface RecordingListProps {
  recordings: RecordingMeta[];
  onSelect: (id: string) => void;
}

const RecordingList: React.FC<RecordingListProps> = ({ recordings, onSelect }) => (
  <div style={{ maxHeight: 400, overflowY: 'auto', borderRight: '1px solid #ccc', paddingRight: 10 }}>
    {recordings.map(r => (
      <div
        key={r.id}
        style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #eee' }}
        onClick={() => onSelect(r.id)}
      >
        <div><b>URL:</b> {r.url}</div>
        <div><b>Browser:</b> {r.browser}</div>
        <div><b>Timestamp:</b> {new Date(r.timestamp).toLocaleString()}</div>
        <div><b>Resolution:</b> {r.resolution}</div>
      </div>
    ))}
  </div>
);

export default RecordingList;
