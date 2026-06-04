export default function SkeletonCard() {
    return (
        <div className="bg-gray-900 rounded-xl p-5 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg mt-0.5 shrink-0" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
                    <div className="flex gap-2">
                        <div className="h-3 bg-gray-800 rounded w-12" />
                        <div className="h-3 bg-gray-800 rounded w-16" />
                        <div className="h-3 bg-gray-800 rounded w-20" />
                    </div>
                </div>
            </div>
            <div className="mt-3 space-y-1.5">
                <div className="h-3 bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-800 rounded w-4/5" />
            </div>
        </div>
    )
}