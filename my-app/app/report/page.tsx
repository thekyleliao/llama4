"use client"

import React, { FC, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Separate client component for the content
const ReportContent: FC = () => {
    const [modification, setModification] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const data = searchParams.get('data');
        console.log('Raw data from URL:', data);
        
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                console.log('Parsed data:', parsedData);
                console.log('English report:', parsedData.report_in_english);
                console.log('Spanish report:', parsedData.report_in_spanish);
                console.log('Follow-up questions:', parsedData.follow_up_questions);
                console.log('Metadata:', parsedData.metadata);
                setReportData(parsedData);
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        } else {
            console.log('No data found in URL parameters');
        }
    }, [searchParams]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
        }, 0);
        window.onafterprint = () => {
            setIsPrinting(false);
            window.onafterprint = null; // Clear the handler
        };
    };

    // Helper function to render text with line breaks
    const renderWithLineBreaks = (text: string | undefined | null) => {
        if (!text) {
            return 'Loading...';
        }
        return text.split('\n').map((line, index, array) => (
            <React.Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    // Get language from metadata or default to Spanish
    const language = reportData?.metadata?.language || 'Spanish';
    const languageHeading = language === 'Spanish' ? 'Español' : language;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Student Progress Report
                </h1>
                <p className="text-xl text-gray-600">
                    Bilingual report for parents and teachers
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Metadata Section - Only shown when metadata is present */}
                {reportData?.metadata && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Report Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Student Information</h3>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                        <dd className="text-gray-900">{reportData.metadata.child_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Grade</dt>
                                        <dd className="text-gray-900">{reportData.metadata.grade}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Information</h3>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Teacher</dt>
                                        <dd className="text-gray-900">{reportData.metadata.teacher_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Parent</dt>
                                        <dd className="text-gray-900">{reportData.metadata.parent_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                                        <dd className="text-gray-900 capitalize">{reportData.metadata.document_type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                                        <dd className="text-gray-900 capitalize">{reportData.metadata.document_purpose}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - English */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            English
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Report</h3>
                                <p className="text-gray-600 whitespace-pre-line">
                                    {renderWithLineBreaks(reportData?.report_in_english)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Translation */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Translation
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Report</h3>
                                <p className="text-gray-600">
                                    {renderWithLineBreaks(reportData?.report_in_spanish)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Follow-up Questions Card */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Follow-up Questions
                    </h2>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {renderWithLineBreaks(reportData?.follow_up_questions)}
                        </p>
                    </div>
                </div>

                {/* Modification Form */}
                {!isPrinting && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Additional Modifications
                        </h2>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label htmlFor="modification" className="block text-sm font-medium text-gray-700 mb-2">
                                    Specify any additional modifications or notes
                                </label>
                                <textarea
                                    id="modification"
                                    name="modification"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter any additional modifications or notes here..."
                                    value={modification}
                                    onChange={(e) => setModification(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Process Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="ml-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                                >
                                    Print
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

// Loading component
const Loading = () => (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
    </div>
);

// Main page component with Suspense
export default function ReportPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ReportContent />
        </Suspense>
    );
}