export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
          />
        </div>
      </div>
    </div>
  );
}
