export default function SkeletonDocument() {
    return (
        <div className="min-h-screen bg-gray-950 text-white animate-pulse">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-4 bg-gray-800 rounded w-20" />
                    <div className="h-4 bg-gray-800 rounded w-40" />
                </div>
                <div className="h-4 bg-gray-800 rounded w-12" />
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header card */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl shrink-0" />
                        <div className="flex-1">
                            <div className="h-5 bg-gray-800 rounded w-1/2 mb-3" />
                            <div className="flex gap-4">
                                <div className="h-3 bg-gray-800 rounded w-16" />
                                <div className="h-3 bg-gray-800 rounded w-24" />
                                <div className="h-3 bg-gray-800 rounded w-12" />
                            </div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded-lg w-20" />
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 w-fit">
                    <div className="h-8 bg-gray-800 rounded-lg w-24" />
                    <div className="h-8 bg-gray-800 rounded-lg w-28" />
                    <div className="h-8 bg-gray-800 rounded-lg w-16" />
                    <div className="h-8 bg-gray-800 rounded-lg w-20" />
                </div>
                
                {/* Content */}
                <div className="bg-gray-900 rounded-xl p-6 space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-5/6" />
                    <div className="h-3 bg-gray-800 rounded w-4/5" />
                    <div className="h-4 bg-gray-800 rounded w-1/4 mt-6 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-5/6" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
            </div>
        </div>
    )
}