'use client';

import { FC, useState, useEffect } from 'react';
import CameraInput from '../web-input/camera';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  getFilesFromSupabase, 
  getMondayOfWeek, 
  formatWeekTitle 
} from '../db/utils';

// Updated interface
interface WeekData {
  mondayDate: Date;
  title: string;
  files: string[];
  subtitle: string;
}

// Updated function to extract date from new filename format
const extractDateFromFilename = (filename: string): string | null => {
  // Updated regex to match new format: assignment-2025-06-01-03-26-16.jpg
  const match = filename.match(/assignment-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
  if (match) {
    // Convert back to ISO format for Date parsing: 2025-06-01-03-26-16 -> 2025-06-01T03:26:16
    const dateStr = match[1];
    const [datePart, timePart] = [
      dateStr.substring(0, 10), // 2025-06-01
      dateStr.substring(11).replace(/-/g, ':') // 03:26:16
    ];
    return `${datePart}T${timePart}`;
  }
  return null;
};

// Camera Card Component
const CameraCard: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full mx-auto border-2 border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">Upload New Assignment</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
          📸 Camera Ready
        </div>
      </div>
      <CameraInput />
    </div>
  );
};

// Week Card Component (simplified)
const WeekCard: FC<WeekData> = ({ mondayDate, title, files, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{subtitle}</h3>
      
      {/* Display assignment files */}
      {files.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Assignments ({files.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {files.slice(0, 6).map((filename, index) => (
              <div key={filename} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${filename}`}
                  alt={`Assignment ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized // Add this temporarily
                  onError={(e) => {
                    console.error('Image failed to load:', filename);
                    console.error('Full URL:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${filename}`);
                    // Hide broken image
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
            {files.length > 6 && (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">+{files.length - 6} more</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeksFromSupabase();
  }, []);

  const loadWeeksFromSupabase = async () => {
    try {
      const files = await getFilesFromSupabase();
      
      // Group files by week
      const weekMap = new Map<string, { files: string[], mondayDate: Date }>();
      
      files.forEach(file => {
        const date = extractDateFromFilename(file.name);
        if (date) {
          const monday = getMondayOfWeek(new Date(date));
          const mondayKey = monday.toISOString().split('T')[0]; // Use date as key
          
          if (!weekMap.has(mondayKey)) {
            weekMap.set(mondayKey, { files: [], mondayDate: monday });
          }
          
          weekMap.get(mondayKey)!.files.push(file.name);
        }
      });

      // Convert to WeekData array
      const weeks: WeekData[] = Array.from(weekMap.entries()).map(([key, data]) => ({
        mondayDate: data.mondayDate,
        title: formatWeekTitle(data.mondayDate),
        files: data.files,
        subtitle: `${data.files.length} Assignment${data.files.length !== 1 ? 's' : ''} Submitted`
      }));

      // Sort by date (most recent first)
      weeks.sort((a, b) => b.mondayDate.getTime() - a.mondayDate.getTime());

      setWeekData(weeks);
    } catch (error) {
      console.error('Error loading weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const response = await fetch('/api/vision');
      const data = await response.json();
      console.log('Vision API response:', data);
      
      if (!data.report_in_english || !data.report_in_spanish || !data.follow_up_questions) {
        throw new Error('Invalid API response structure');
      }

      router.push('/report');
    } catch (error) {
      console.error('Error fetching vision data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Educational Progress
        </h1>
        
        {/* Camera Card - Always visible at top */}
        <CameraCard />
        
        {/* Week Data Cards */}
        {weekData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">No assignments uploaded yet.</p>
            <p className="text-gray-500">Start by uploading your first assignment using the camera above!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weekData.map((week) => (
              <WeekCard key={week.mondayDate.toISOString()} {...week} />
            ))}
          </div>
        )}
        
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