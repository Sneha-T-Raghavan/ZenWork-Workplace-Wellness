const WorkplaceInsights = ({ insights }) => {
    if (!insights) return null;

    // Calculate percentages for patterns
    const totalEntries = insights.sentiment.positiveDays + insights.sentiment.challengingDays + 
        (insights.sentiment.average * 10 - insights.sentiment.positiveDays - insights.sentiment.challengingDays);
    
    const absoluteLanguagePercent = insights.patterns.absoluteLanguage / totalEntries * 100;
    const negativeFramingPercent = insights.patterns.negativeFraming / totalEntries * 100;
    const achievementsPercent = insights.patterns.achievements / totalEntries * 100;

    // Get top 3 tags
    const topTags = Object.entries(insights.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag, count]) => ({ tag, count }));

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Your Workplace Wellness Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Mood Summary */}
                <div className="bg-blue-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Mood Summary</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                        {insights.sentiment.average?.toFixed(1) || '0'}/10
                    </p>
                    <p className="text-xs text-blue-700">
                        Trend: <span className={
                            insights.sentiment.trend === 'improving' ? 'text-green-600' :
                            insights.sentiment.trend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                        }>
                            {insights.sentiment.trend}
                        </span>
                    </p>
                </div>
                
                {/* Positive Days */}
                <div className="bg-green-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-green-800">Positive Days</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                        {insights.sentiment.positiveDays || '0'}
                    </p>
                    <p className="text-xs text-green-700">
                        {((insights.sentiment.positiveDays / totalEntries) * 100 || 0).toFixed(0)}% of entries
                    </p>
                </div>
                
                {/* Challenging Days */}
                <div className="bg-yellow-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-yellow-800">Challenging Days</h4>
                    <p className="text-2xl font-bold text-yellow-600 mb-1">
                        {insights.sentiment.challengingDays || '0'}
                    </p>
                    <p className="text-xs text-yellow-700">
                        {((insights.sentiment.challengingDays / totalEntries) * 100 || 0).toFixed(0)}% of entries
                    </p>
                </div>
            </div>
            
            {/* NLP Patterns */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Your Language Patterns</h4>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Absolute Language (must, have to)</span>
                            <span>{absoluteLanguagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${absoluteLanguagePercent}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Negative Framing</span>
                            <span>{negativeFramingPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${negativeFramingPercent}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Achievements Noted</span>
                            <span>{achievementsPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${achievementsPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Common Themes */}
            <div>
                <h4 className="text-sm font-medium mb-2">Frequent Topics</h4>
                <div className="flex flex-wrap gap-2">
                    {topTags.map(({ tag, count }) => (
                        <span 
                            key={tag} 
                            className="px-3 py-1 bg-gray-100 rounded-full text-xs"
                        >
                            {tag} ({count})
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Common Themes Suggestions */}
            {insights.commonThemes?.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Theme-Based Suggestions</h4>
                    <div className="space-y-2">
                        {insights.commonThemes.map((theme, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded">
                                <div className="flex justify-between items-start">
                                    <h5 className="font-medium text-sm">{theme.theme}</h5>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        theme.frequency === 'high' ? 'bg-red-100 text-red-800' :
                                        theme.frequency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {theme.frequency}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{theme.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkplaceInsights;