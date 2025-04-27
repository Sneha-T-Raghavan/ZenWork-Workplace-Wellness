const NLPAnalysis = ({ analysis }) => {
    if (!analysis || typeof analysis !== 'object') return null;

    return (
        <div className="bg-blue-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                <span className="mr-2">🧘</span> Your NLP Workplace Analysis
            </h3>
            
            <div className="space-y-4">
                {/* Language Patterns */}
                {analysis.languagePatterns && (
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">💬</span>
                            <h4 className="font-medium">Language Patterns</h4>
                        </div>
                        
                        {analysis.languagePatterns.absoluteTerms?.length > 0 && (
                            <>
                                <p className="text-gray-700 mb-2">
                                    You used absolute terms like: <span className="font-medium">
                                        {analysis.languagePatterns.absoluteTerms.join(', ')}
                                    </span>
                                </p>
                                <div className="bg-blue-50 p-3 rounded">
                                    <h5 className="text-sm font-medium text-blue-700 mb-1">
                                        Suggested Reframes:
                                    </h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {analysis.languagePatterns.suggestedReframes?.map((reframe, i) => (
                                            <li key={i} className="text-sm text-blue-700">{reframe}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        
                        {analysis.languagePatterns.modalOperators?.length > 0 && (
                            <p className="text-gray-700 mt-3">
                                Modal operators detected: <span className="font-medium">
                                    {analysis.languagePatterns.modalOperators.join(', ')}
                                </span>
                            </p>
                        )}
                    </div>
                )}
                
                {/* Cognitive Patterns */}
                {analysis.cognitivePatterns && (
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">🧠</span>
                            <h4 className="font-medium">Cognitive Patterns</h4>
                        </div>
                        
                        {analysis.cognitivePatterns.distortions?.length > 0 ? (
                            <>
                                <p className="text-gray-700 mb-2">
                                    Identified patterns: <span className="font-medium">
                                        {analysis.cognitivePatterns.distortions.join(', ')}
                                    </span>
                                </p>
                                {analysis.cognitivePatterns.examples?.length > 0 && (
                                    <div className="bg-purple-50 p-3 rounded">
                                        <h5 className="text-sm font-medium text-purple-700 mb-1">
                                            Examples from your entry:
                                        </h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {analysis.cognitivePatterns.examples.map((example, i) => (
                                                <li key={i} className="text-sm text-purple-700">{example}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-700">No significant cognitive distortions identified</p>
                        )}
                    </div>
                )}
                
                {/* Relationships */}
                {analysis.relationships && (
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">🤝</span>
                            <h4 className="font-medium">Workplace Relationships</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-sm font-medium mb-1">Positive Interactions</h5>
                                {analysis.relationships.positiveInteractions?.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                        {analysis.relationships.positiveInteractions.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">None noted in this entry</p>
                                )}
                            </div>
                            
                            <div>
                                <h5 className="text-sm font-medium mb-1">Challenging Interactions</h5>
                                {analysis.relationships.challengingInteractions?.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                        {analysis.relationships.challengingInteractions.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">None noted in this entry</p>
                                )}
                            </div>
                        </div>
                        
                        {analysis.relationships.suggestions?.length > 0 && (
                            <div className="mt-3 bg-green-50 p-3 rounded">
                                <h5 className="text-sm font-medium text-green-700 mb-1">
                                    Relationship Suggestions:
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                    {analysis.relationships.suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-sm text-green-700">{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Achievements */}
                {analysis.achievements?.length > 0 && (
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">🏆</span>
                            <h4 className="font-medium">Your Achievements</h4>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            {analysis.achievements.map((achievement, i) => (
                                <li key={i}>{achievement}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NLPAnalysis;