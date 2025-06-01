"use client"

import React, { FC, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Separate client component for the content
const ReportContent: FC = () => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEnglishReport, setEditedEnglishReport] = useState('');
    const [editedSpanishReport, setEditedSpanishReport] = useState('');
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
                setEditedEnglishReport(parsedData.report_in_english);
                setEditedSpanishReport(parsedData.report_in_spanish);
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        } else {
            console.log('No data found in URL parameters');
        }
    }, [searchParams]);

    const handlePrint = () => {
        setIsPrinting(true);
        // Add print-specific styles
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                /* Hide elements we don't want to print */
                button, 
                .no-print {
                    display: none !important;
                }
                /* Remove background colors for better printing */
                body {
                    background: white !important;
                }
                /* Ensure content takes full width */
                .max-w-7xl {
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                /* Remove shadows and adjust spacing for print */
                .shadow-lg {
                    box-shadow: none !important;
                }
                .p-6 {
                    padding: 1rem !important;
                }
                /* Ensure text is black for better printing */
                .text-gray-600, .text-gray-900 {
                    color: black !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            window.print();
            // Clean up after printing
            document.head.removeChild(style);
            setIsPrinting(false);
        }, 0);
        
        window.onafterprint = () => {
            setIsPrinting(false);
            window.onafterprint = null;
        };
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        if (reportData) {
            const updatedData = {
                ...reportData,
                report_in_english: editedEnglishReport,
                report_in_spanish: editedSpanishReport
            };
            setReportData(updatedData);
            // Update URL with new data
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('data', JSON.stringify(updatedData));
            window.history.pushState({}, '', newUrl.toString());
        }
        setIsEditing(false);
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
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mb-6">
                    <button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    {isEditing && (
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Save
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Print
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                </div>

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
                                {isEditing ? (
                                    <textarea
                                        value={editedEnglishReport}
                                        onChange={(e) => setEditedEnglishReport(e.target.value)}
                                        className="w-full h-64 p-2 border rounded"
                                    />
                                ) : (
                                    <p className="text-gray-600 whitespace-pre-line">
                                        {renderWithLineBreaks(reportData?.report_in_english)}
                                    </p>
                                )}
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
                                {isEditing ? (
                                    <textarea
                                        value={editedSpanishReport}
                                        onChange={(e) => setEditedSpanishReport(e.target.value)}
                                        className="w-full h-64 p-2 border rounded"
                                    />
                                ) : (
                                    <p className="text-gray-600">
                                        {renderWithLineBreaks(reportData?.report_in_spanish)}
                                    </p>
                                )}
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