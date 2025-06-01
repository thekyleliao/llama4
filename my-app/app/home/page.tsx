'use client';

import { FC } from 'react';
// Link import was present but not used, can be removed if not needed elsewhere.
// import Link from 'next/link'; 
import CameraInput from '../web-input/camera';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Types for our week data
interface WeekData {
  weekNumber: number;
  subtitle: string;
  topicStudied: string;
  culturalNotes: string;
  exp: number; // exp is still part of the data structure
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
// The 'exp' prop is destructured but no longer used for display.
// Other props like subtitle, topicStudied, culturalNotes are also destructured but not used in the provided WeekCard JSX.
// This is fine, but you might consider removing them from destructuring if they aren't planned for use in this component.
const WeekCard: FC<WeekData> = ({ weekNumber, subtitle, topicStudied, culturalNotes, exp }) => {
  if (weekNumber === 3) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600">Week {weekNumber}</h2>
          {/* EXP display removed from here */}
        </div>
        <CameraInput />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">Week {weekNumber}</h2>
        {/* EXP display removed from here */}
      </div>
      
      <div className="relative w-full h-[400px]">
        <Image
          src={`/page${weekNumber}.jpg`}
          alt={`Week ${weekNumber} homework`}
          fill // Changed from layout="fill" to fill for Next.js 13+ Image component
          className="object-contain rounded-lg"
          priority={weekNumber === 1} // Example: only prioritize the first image, adjust as needed
        />
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();

  const handleCreateReport = async () => {
    try {
      const response = await fetch('/api/vision');
      const data = await response.json();
      console.log('Vision API response:', data);
      
      // Ensure we have the expected data structure
      if (!data.report_in_english || !data.report_in_spanish || !data.follow_up_questions) {
        console.error('Missing required data fields:', data);
        // Optionally, provide user feedback here (e.g., an alert or a toast message)
        return;
      }

      const encodedData = encodeURIComponent(JSON.stringify(data));
      console.log('Encoded data for URL:', encodedData);
      
      router.push(`/report?data=${encodedData}`);
    } catch (error) {
      console.error('Error fetching vision data:', error);
      // Optionally, provide user feedback here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Educational Progress Tracker
        </h1>
        
        <div className="space-y-6">
          {weekData.map((week) => (
            <WeekCard key={week.weekNumber} {...week} />
          ))}
        </div>
        <div className="text-center mt-8">
          <button 
            onClick={handleCreateReport}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Create New Report →
          </button>
        </div>
      </div>
    </div>
  );
}