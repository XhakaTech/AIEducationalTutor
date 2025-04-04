import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || '';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || res.statusText;
    } catch {
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

function getAuthHeaders(hasBody: boolean = false) {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: getAuthHeaders(!!data),
      body: data ? JSON.stringify(data) : undefined,
      mode: 'cors'
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Could not connect to server. Please try again later.`);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    try {
      const res = await fetch(fullUrl, {
        headers: getAuthHeaders(),
        mode: 'cors'
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Could not connect to server. Please try again later.`);
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
