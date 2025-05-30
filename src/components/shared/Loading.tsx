// a simple loading spinner component
const Loading = () => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/50'>
      <div className='h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary' />
    </div>
  );
};

export default Loading;
