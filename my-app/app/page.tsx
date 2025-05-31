import { FC } from 'react';
import CameraInput from './web-input/camera';
import AudioInput from './web-input/microphone';
import TextInput from './web-input/text';

// Types for our week data
interface WeekData {
  weekNumber: number;
  subtitle: string;
  topicStudied: string;
  culturalNotes: string;
  exp: number;
}

// Sample data - in a real app, this would come from an API or database
const weekData: WeekData[] = [
  {
    weekNumber: 1,
    subtitle: "Introduction to Language Basics",
    topicStudied: "Basic grammar structures and essential vocabulary for daily conversations. Focus on present tense and common expressions.",
    culturalNotes: "Understanding cultural context and social norms in everyday interactions.",
    exp: 150
  },
  {
    weekNumber: 2,
    subtitle: "Building Vocabulary",
    topicStudied: "Expanding vocabulary through themed lessons. Practice with common scenarios and situations.",
    culturalNotes: "Exploring cultural traditions and their influence on language use.",
    exp: 200
  },
  {
    weekNumber: 3,
    subtitle: "Conversation Skills",
    topicStudied: "Developing fluency in basic conversations. Practice with role-playing and real-world scenarios.",
    culturalNotes: "Understanding cultural nuances in communication styles.",
    exp: 250
  }
];

// Week Card Component
const WeekCard: FC<WeekData> = ({ weekNumber, subtitle, topicStudied, culturalNotes, exp }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">Week {weekNumber}</h2>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
          {exp} EXP
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{subtitle}</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Topic Studied</h4>
          <p className="text-gray-600">{topicStudied}</p>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Cultural Notes</h4>
          <p className="text-gray-600">{culturalNotes}</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Educational Progress Tracker
        </h1>
        <div className="text-3xl font-bold text-gray-900 text-center mb-8">
          <CameraInput/>
        </div>
        <div className="text-3xl font-bold text-gray-900 text-center mb-8">
          <AudioInput/>
        </div>
        <div className="text-3xl font-bold text-gray-900 text-center mb-8">
          <TextInput/>
        </div>
        <div className="space-y-6">
          {weekData.map((week) => (
            <WeekCard key={week.weekNumber} {...week} />
          ))}
        </div>
      </div>
    </div>
  );
}
