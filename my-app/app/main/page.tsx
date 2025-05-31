// app/capture/page.tsx (or pages/capture.tsx)

import { FC } from 'react';
// Adjust the import path if your web-input folder is located elsewhere
import CameraInput from '../web-input/camera';


const CapturePage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Page Title */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Parental Engagment Tool
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Provide multilingual feedback report
          </p>
        </div>

        {/* Camera Input Section */}
        <div className="rounded-lg bg-white p-6 shadow-xl sm:p-8">
          <h3 className="mb-6 text-center text-xl font-semibold text-gray-700">
            Scan Assignment
          </h3>
          <div className="flex items-center justify-center">
            <CameraInput />
          </div>
        </div>

        {/* Stylized Input Form Section */}
        <form className="space-y-6 rounded-lg bg-white p-6 shadow-xl sm:p-8">
          {/* Language Input */}
          <div>
            <label
              htmlFor="language"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <input
              id="language"
              name="language"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Spanish, French"
            />
          </div>

          {/* Name of Recipient Input */}
          <div>
            <label
              htmlFor="recipientName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Name of Recipient
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Additional Comments Input */}
          <div>
            <label
              htmlFor="additionalComments"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Additional Comments
            </label>
            <textarea
              id="additionalComments"
              name="additionalComments"
              rows={4}
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter any additional information here..."
            />
          </div>

          {/* Submit Button (Optional - for UI completeness) */}
          <div className="pt-2"> {/* Reduced top padding slightly */}
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Submit Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapturePage;