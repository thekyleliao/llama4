"use client"

import { FC, useState } from 'react';

const ReportPage: FC = () => {
    const [modification, setModification] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
        }, 0);
        window.onafterprint = () => {
            setIsPrinting(false);
            window.onafterprint = null;
        };
    };

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
            <div className="max-w-7xl mx-auto">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Left Column - Language 1 */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            English
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Progress</h3>
                                <p className="text-gray-600">
                                    The student has shown significant improvement in mathematics and reading comprehension.
                                    Their participation in class discussions has increased, demonstrating better engagement
                                    with the material.
                                </p>
                            </div>
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Areas of Strength</h3>
                                <p className="text-gray-600">
                                    • Strong problem-solving skills<br />
                                    • Excellent teamwork abilities<br />
                                    • Consistent homework completion
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Areas for Growth</h3>
                                <p className="text-gray-600">
                                    • Time management during tests<br />
                                    • Organization of study materials<br />
                                    • Participation in group activities
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Language 2 */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Español
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Progreso Académico</h3>
                                <p className="text-gray-600">
                                    El estudiante ha mostrado una mejora significativa en matemáticas y comprensión lectora.
                                    Su participación en las discusiones de clase ha aumentado, demostrando un mejor
                                    compromiso con el material.
                                </p>
                            </div>
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Áreas de Fortaleza</h3>
                                <p className="text-gray-600">
                                    • Fuertes habilidades de resolución de problemas<br />
                                    • Excelentes habilidades de trabajo en equipo<br />
                                    • Completación consistente de tareas
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Áreas de Mejora</h3>
                                <p className="text-gray-600">
                                    • Gestión del tiempo durante los exámenes<br />
                                    • Organización de materiales de estudio<br />
                                    • Participación en actividades grupales
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modification Form */}
                {!isPrinting && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Additional Modifications
                        </h2>
                        <form className="space-y-4">
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

export default ReportPage;
