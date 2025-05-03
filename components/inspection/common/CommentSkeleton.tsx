export const CommentSkeleton = () => {

    return (
        <div className="flex gap-2 w-auto py-4 animate-pulse">
            <div className="h-24">
                <div className="w-11.25 min-w-11.25 h-11.25 rounded-2xl bg-wolf" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-col gap-1">
                    <div className="w-24 h-4 bg-wolf rounded-md" />
                    <div className="w-16 h-3 bg-wolf rounded-md" />
                </div>

                <div className="w-full h-4 bg-wolf rounded-md" />
                <div className="w-5/6 h-4 bg-wolf rounded-md" />

                <div className="flex gap-2 mt-2">
                    <div className="w-10 h-3 bg-wolf rounded-md" />
                    <div className="w-14 h-3 bg-wolf rounded-md" />
                    <div className="w-6 h-3 bg-wolf rounded-md" />
                </div>
            </div>
        </div>
    );
};