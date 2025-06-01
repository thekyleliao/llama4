'use client';

import { FC, useState, useEffect } from 'react';
import CameraInput from '../web-input/camera';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  getFilesFromSupabase, 
  getMondayOfWeek, 
  formatWeekTitle,
  deleteFromSupabaseClient 
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

// User Input Form Component
interface UserInputFormProps {
  formData: {
    language: string;
    grade: string;
    teacherName: string;
    parentName: string;
    childName: string;
    purpose: string;
    type: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const UserInputForm: FC<UserInputFormProps> = ({ formData, onFormChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full mx-auto border-2 border-blue-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Report Details</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
          📝 Required Information
        </div>
      </div>
      
      <form className="space-y-6">
        {/* Language Selection */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Specify Language
          </label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter language (e.g., English, Spanish, Bilingual)"
            style={{ color: 'black' }}
          />
        </div>

        {/* Dropdowns Section */}
        {/* Child Grade */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            Child's Grade
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            style={{ color: 'black' }}
          >
            <option value="">Select Grade</option>
            <option value="k">Kindergarten</option>
            <option value="1">1st Grade</option>
            <option value="2">2nd Grade</option>
            <option value="3">3rd Grade</option>
            <option value="4">4th Grade</option>
            <option value="5">5th Grade</option>
            <option value="6">6th Grade</option>
            <option value="7">7th Grade</option>
            <option value="8">8th Grade</option>
          </select>
        </div>

        {/* Document Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Document Purpose
          </label>
          <select
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            style={{ color: 'black' }}
          >
            <option value="">Select Purpose</option>
            <option value="progress">Progress Report</option>
            <option value="assessment">Assessment</option>
            <option value="feedback">General Feedback</option>
            <option value="improvement">Areas of Improvement</option>
          </select>
        </div>

        {/* Document Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            style={{ color: 'black' }}
          >
            <option value="">Select Type</option>
            <option value="homework">Homework</option>
            <option value="test">Test</option>
            <option value="project">Project</option>
            <option value="classwork">Classwork</option>
          </select>
        </div>

        {/* Names Section */}
        {/* Teacher Name */}
        <div>
          <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">
            Teacher Name
          </label>
          <input
            type="text"
            id="teacherName"
            name="teacherName"
            value={formData.teacherName}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter teacher's name"
            style={{ color: 'black' }}
          />
        </div>

        {/* Parent Name */}
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Name
          </label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter parent's name"
            style={{ color: 'black' }}
          />
        </div>

        {/* Child Name */}
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
            Child Name
          </label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={onFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter child's name"
            style={{ color: 'black' }}
          />
        </div>
      </form>
    </div>
  );
};

// Week Card Component (simplified)
const WeekCard: FC<WeekData> = ({ mondayDate, title, files, subtitle }) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (filename: string) => {
    try {
      setIsDeleting(filename);
      const { success, error } = await deleteFromSupabaseClient(filename);
      if (success) {
        // Refresh the page to update the list
        window.location.reload();
      } else {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('An error occurred while deleting the file.');
    } finally {
      setIsDeleting(null);
    }
  };

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
              <div key={filename} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${filename}`}
                  alt={`Assignment ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    console.error('Image failed to load:', filename);
                    console.error('Full URL:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports/${filename}`);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Delete button overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDelete(filename)}
                    disabled={isDeleting === filename}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                    title="Delete image"
                  >
                    {isDeleting === filename ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
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
  const [formData, setFormData] = useState({
    language: '',
    grade: '',
    teacherName: '',
    parentName: '',
    childName: '',
    purpose: '',
    type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isFormValid = () => {
    return (
      formData.language.trim() !== '' &&
      formData.grade !== '' &&
      formData.teacherName.trim() !== '' &&
      formData.parentName.trim() !== '' &&
      formData.childName.trim() !== '' &&
      formData.purpose !== '' &&
      formData.type !== ''
    );
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewReport = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: formData.language,
          grade: formData.grade,
          teacher_name: formData.teacherName,
          parent_name: formData.parentName,
          child_name: formData.childName,
          document_type: formData.type,
          document_purpose: formData.purpose
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const data = await response.json();
      console.log('Vision API response:', data);

      if (!data.report_in_english || !data.report_in_spanish || !data.follow_up_questions) {
        throw new Error('Invalid API response structure');
      }

      // Encode the data and pass it to the report page
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/report?data=${encodedData}`);
    } catch (error) {
      console.error('Error creating new report:', error);
      // TODO: Add error handling UI
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleTestReport = async () => {
    try {
      const response = await fetch('/api/vision');
      const data = await response.json();
      console.log('Vision API response:', data);
      
      if (!data.report_in_english || !data.report_in_spanish || !data.follow_up_questions) {
        throw new Error('Invalid API response structure');
      }

      // Encode the data and pass it to the report page
      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/report?data=${encodedData}`);
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
          Parent Bridge
        </h1>
        
        {/* Camera Card - Always visible at top */}
        <CameraCard />
        
        {/* Create Report Button */}
        <div className="text-center mb-8 space-y-4">
          <button 
            onClick={handleNewReport}
            disabled={!isFormValid() || isSubmitting}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
              isFormValid() && !isSubmitting
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
          >
            {isSubmitting ? 'Creating Report...' : 'Create New Report →'}
          </button>
          <div>
            <button 
              onClick={handleTestReport}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Test Report →
            </button>
          </div>
        </div>
        
        {/* User Input Form */}
        <UserInputForm formData={formData} onFormChange={handleFormChange} />
        
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

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-12 w-full mx-auto border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600">About Parent Bridge</h2>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
              ℹ️ Information
            </div>
          </div>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 mb-4">
              Parent Bridge is a powerful tool designed to enhance communication between teachers and parents about student progress. 
              Our platform makes it easy to document, share, and track educational achievements and areas for improvement.
            </p>
            <p className="text-gray-700 mb-4">
              Key Features:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Upload and document student assignments and progress</li>
              <li>Generate detailed reports in both English and Spanish</li>
              <li>Track progress over time with weekly summaries</li>
              <li>Receive personalized follow-up questions for continued improvement</li>
              <li>Easy-to-use interface for both teachers and parents</li>
            </ul>
            <p className="text-gray-700">
              Get started by uploading your first assignment using the camera above, or create a new report to document student progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}