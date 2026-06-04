export default function SkeletonWorkspace() {
    return (
        <div className="bg-gray-900 rounded-xl p-5 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
                    <div className="flex gap-4">
                        <div className="h-3 bg-gray-800 rounded w-20" />
                        <div className="h-3 bg-gray-800 rounded w-24" />
                        <div className="h-3 bg-gray-800 rounded w-16" />
                    </div>
                </div>
            </div>
        </div>
    )
}