import { useState, useContext, useEffect } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import WorkplaceInsights from '../components/WorkplaceInsights';
import NLPAnalysis from '../components/NLPAnalysis';
import NLPActionSteps from '../components/NLPActionSteps';
import Navbar from '../components/Navbar';

const Journal = () => {
    const [entry, setEntry] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [entries, setEntries] = useState([]);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true); // Add initial load state
    const { user, backendUrl } = useContext(AppContent);

    const fetchEntries = async () => {
        console.log('Starting fetch...');
        setIsFetching(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/journal/entries`, {
                withCredentials: true
            });
            console.log('Fetch response:', data); // Check the response data
            
            if (data.success) {
                setEntries(data.entries);
                setInsights(data.insights);
            }
        } catch (error) {
            console.error('Full fetch error:', error);
            toast.error('Failed to fetch entries');
        } finally {
            setIsFetching(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        console.log('User context:', user); // Check if user exists
        console.log('Backend URL:', backendUrl); // Check if URL is correct
        if (user) {
            console.log('Fetching entries...');
            fetchEntries();
        }
    }, [user, backendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!entry.trim()) {
            toast.error('Journal entry cannot be empty');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/journal/analyze`, 
                { entry },
                { withCredentials: true }
            );
            
            if (data.success) {
                setAnalysis(data.journalEntry.analysis);
                setEntries(prev => [data.journalEntry, ...prev]);
                setEntry('');
                fetchEntries(); // Refresh insights
                toast.success('Journal entry analyzed with NLP insights');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Analysis failed');
            console.error('Submit error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteAction = async (action) => {
        try {
            await axios.post(
                `${backendUrl}/api/journal/track-action`,
                { action, completed: true },
                { withCredentials: true }
            );
            toast.success(`Action "${action}" marked as completed!`);
            fetchEntries(); // Refresh data
        } catch (error) {
            toast.error('Failed to track action');
            console.error('Action tracking error:', error);
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
            <Navbar />
            
            <div className="flex-1 px-6 lg:px-12 py-20 mx-auto w-full max-w-6xl">
                <h2 className="text-2xl font-bold text-center mt-8">Workplace Wellness Journal</h2>
                <p className="text-center text-gray-600 mt-2">
                    Reflect on your workday using NLP principles to improve communication and mindset
                </p>
                
                {/* Insights Dashboard */}
                {insights && <WorkplaceInsights insights={insights} />}
                
                {/* Journal Entry Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Workday Reflection
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Consider: Communication patterns, achievements, challenges, relationships
                            </p>
                            <textarea
                                rows={6}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                placeholder="E.g., 'Today in a meeting I felt... My colleague said... I noticed I was using language like...'"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Analyzing with NLP...' : 'Submit Reflection'}
                        </button>
                    </form>
                </div>

                {/* NLP Analysis Result */}
                {analysis && (
                    <>
                        <NLPAnalysis analysis={analysis} />
                        <NLPActionSteps 
                            analysis={analysis} 
                            onCompleteAction={handleCompleteAction}
                        />
                    </>
                )}

                {/* Previous Entries */}
                <div className="space-y-6 mt-8">
                    <h3 className="text-lg font-medium">Your Reflection History</h3>
                    {initialLoad ? (
                        <div className="text-center py-4">Loading your journal entries...</div>
                    ) : isFetching ? (
                        <div className="text-center py-4">Refreshing entries...</div>
                    ) : entries.length > 0 ? (
                        entries.map((item) => (
                            <div key={item._id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <div className="flex space-x-2">
                                        {item.tags?.map(tag => (
                                            <span key={tag} className="px-2 py-1 rounded-full text-xs bg-gray-100">
                                                {tag}
                                            </span>
                                        ))}
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            item.sentimentScore >= 7 ? 'bg-green-100 text-green-800' :
                                            item.sentimentScore <= 4 ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            Mood: {item.sentimentScore}/10
                                        </span>
                                    </div>
                                </div>
                                <p className="mb-3 whitespace-pre-line">{item.entry}</p>
                                <div className="bg-blue-50 p-3 rounded">
                                    <h4 className="font-medium text-blue-800 mb-1">NLP Insights</h4>
                                    {typeof item.analysis === 'object' ? (
                                        <div className="text-blue-700 text-sm">
                                            <p><strong>Language Patterns:</strong> {item.analysis.languagePatterns?.absoluteTerms?.join(', ') || 'None noted'}</p>
                                            <p><strong>Cognitive Patterns:</strong> {item.analysis.cognitivePatterns?.distortions?.join(', ') || 'None noted'}</p>
                                            <p><strong>Relationships:</strong> {item.analysis.relationships?.positiveInteractions?.join(', ') || 'None noted'}</p>
                                        </div>
                                    ) : (
                                        <p className="text-blue-700 whitespace-pre-line text-sm">{item.analysis}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No reflections yet. Start by adding your first workday reflection.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Journal;