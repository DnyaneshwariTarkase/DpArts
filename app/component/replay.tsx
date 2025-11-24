import React, { useEffect, useState } from 'react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { EventType } from 'rrweb';

interface ReplayProps {
  recordingId: string;
}

const Replay: React.FC<ReplayProps> = ({ recordingId }) => {
  const [events, setEvents] = useState<EventType[] | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem(`session_${recordingId}`);
    if (sessionData) {
      setEvents(JSON.parse(sessionData));
    }
  }, [recordingId]);

  useEffect(() => {
    if (events && events.length) {
      const container = document.getElementById('replay') as HTMLElement;
      new rrwebPlayer({
        target: container,
        props: {
          events: events as any,
          autoPlay: true,
          showController: true,
          width: container.offsetWidth,
          height: 600,
        },
      });
    }
  }, [events]);

  return <div id="replay" style={{ width: '100%', height: 600 }} />;
};

export default Replay;
