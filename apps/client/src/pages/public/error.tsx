import { t } from "@lingui/macro";
import { Briefcase, HouseSimpleIcon, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@resume-space/ui";
import { Link, useRouteError, useNavigate } from "react-router";

import { LocaleProvider } from "@/client/providers/locale";

type RouterError = {
  statusText?: string;
  message?: string;
  status: number;
  data: string;
} & Error;

const getErrorMessage = (status: number) => {
  switch (status) {
    case 404: {
      return t`The page you're looking for doesn't exist.`;
    }
    case 403: {
      return t`You don't have permission to access this page.`;
    }
    case 500: {
      return t`An internal server error occurred.`;
    }
    case 401: {
      return t`You are not authorized to access this page.`;
    }
    case 400: {
      return t`The request was invalid.`;
    }
    default: {
      return t`An unexpected error occurred.`;
    }
  }
};

const getErrorTitle = (status: number) => {
  switch (status) {
    case 404: {
      return t`Page Not Found`;
    }
    case 403: {
      return t`Access Denied`;
    }
    case 500: {
      return t`Server Error`;
    }
    case 401: {
      return t`Unauthorized`;
    }
    default: {
      return t`Error ${status}`;
    }
  }
};

export const ErrorPage = () => {
  const error = useRouteError() as RouterError;
  const navigate = useNavigate();
  const statusCode = error?.status || 404;
  const is404 = statusCode === 404;

  return (
    <LocaleProvider>
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">{statusCode}</h1>
            <h2 className="text-2xl font-semibold">{getErrorTitle(statusCode)}</h2>
          </div>

          <p className="break-words text-sm text-muted-foreground">
            {error?.data || error?.message || getErrorMessage(statusCode)}
          </p>

          {is404 && (
            <p className="text-xs text-muted-foreground/75">
              {t`The URL you're trying to access might be incorrect or the resource has been moved.`}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <HouseSimpleIcon size={18} className="mr-2" />
                {t`Go Home`}
              </Link>
            </Button>

            {is404 && (
              <Button asChild size="lg" variant="outline">
                <Link to="/jobs">
                  <Briefcase size={18} className="mr-2" />
                  {t`Browse Jobs`}
                </Link>
              </Button>
            )}

            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-2" />
              {t`Go Back`}
            </Button>
          </div>
        </div>
      </main>
    </LocaleProvider>
  );
};
