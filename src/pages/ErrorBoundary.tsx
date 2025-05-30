import { useRouteError, Link } from 'react-router-dom';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/Footer';
import { isAxiosError } from 'axios';
import { isHttpResponseError } from '@/lib/throwWithErr';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className='bg-background text-foreground flex min-h-screen flex-col'>
      <Header isBasic={true} />

      <main className='outer-container flex-grow'>
        <div className='inner-container flex flex-col gap-4'>
          <h1>Oops! Something went wrong.</h1>

          {/* Handle custom HttpResponseError (recommended) */}
          {isHttpResponseError(error) && (
            <>
              <p>
                Status: {error.status} {error.statusText}
              </p>
              <p>Message: {error.message || 'Unknown error'}</p>
            </>
          )}

          {/* Handle native JS Errors */}
          {!isHttpResponseError(error) && error instanceof Error && (
            <>
              <p>Message: {error.message}</p>

              {/* Axios-specific error handling */}
              {isAxiosError(error) ? (
                <>
                  {error.response ? (
                    <>
                      <p>Status: {error.response.status}</p>
                      <p>Details: {error.response.data?.message || 'No details'}</p>
                    </>
                  ) : error.request ? (
                    <>
                      <p>Status: Request made but no response received.</p>
                      <p>Details: {error.request.statusText || 'No details'}</p>
                    </>
                  ) : (
                    <p>Unknown Axios error.</p>
                  )}
                </>
              ) : (
                <p>Unknown JS error.</p>
              )}
            </>
          )}

          {/* Fallback for unknown errors */}
          {!isHttpResponseError(error) && !(error instanceof Error) && (
            <p>Unknown error: {JSON.stringify(error)}</p>
          )}

          <Link to='/'>Go back to home</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ErrorBoundary;
