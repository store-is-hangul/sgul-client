"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type FetchStatus = "idle" | "loading" | "success" | "error";

/** API 응답 공통 형식 */
interface ApiResponse<T> {
  code: number;
  message: string | null;
  value: T;
}

interface UseFetchOptions<T> {
  /** 컴포넌트 마운트 시 자동으로 fetch 실행 여부 (기본값: true) */
  immediate?: boolean;
  /** 요청 시 사용할 기본 헤더 */
  headers?: HeadersInit;
  /** 응답 데이터의 초기값 */
  initialData?: T;
  /** 에러 발생 시 실행될 콜백 */
  onError?: (error: Error) => void;
  /** 성공 시 실행될 콜백 */
  onSuccess?: (data: T) => void;
}

interface UseFetchReturn<T> {
  /** 응답 데이터 */
  data: T | undefined;
  /** 현재 fetch 상태 */
  status: FetchStatus;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 수동으로 fetch 실행 */
  refetch: () => Promise<T | undefined>;
  /** 데이터 초기화 */
  reset: () => void;
}

/**
 * 데이터 fetching을 위한 Hook
 *
 * @template T - 응답 데이터의 타입
 * @param url - fetch할 URL
 * @param options - 추가 옵션
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * const { data, isLoading, error } = useFetch<User[]>("/api/users");
 *
 * // 수동 fetch
 * const { data, refetch } = useFetch<User>("/api/user/1", { immediate: false });
 * const handleClick = () => refetch();
 *
 * // 콜백 사용
 * const { data } = useFetch<User[]>("/api/users", {
 *   onSuccess: (data) => console.log("Loaded:", data),
 *   onError: (error) => console.error("Failed:", error),
 * });
 * ```
 */
export const useFetch = <T = unknown>(
  url: string,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> => {
  const {
    immediate = true,
    headers,
    initialData,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onError, onSuccess]);

  const refetch = useCallback(async (): Promise<T | undefined> => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = (await response.json()) as ApiResponse<T>;
      const result = apiResponse.value;
      setData(result);
      setStatus("success");
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      const fetchError =
        err instanceof Error ? err : new Error("An unknown error occurred");
      setError(fetchError);
      setStatus("error");
      onErrorRef.current?.(fetchError);
      return undefined;
    }
  }, [url, headers]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, [immediate, refetch]);

  const reset = useCallback(() => {
    setData(initialData);
    setStatus("idle");
    setError(null);
  }, [initialData]);

  return {
    data,
    status,
    isLoading: status === "loading",
    error,
    refetch,
    reset,
  };
};

interface UseMutationOptions<T, V> {
  /** 요청 시 사용할 HTTP 메서드 (기본값: "POST") */
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  /** 요청 시 사용할 기본 헤더 */
  headers?: HeadersInit;
  /** 에러 발생 시 실행될 콜백 */
  onError?: (error: Error) => void;
  /** 성공 시 실행될 콜백 */
  onSuccess?: (data: T, variables: V) => void;
}

interface UseMutationReturn<T, V> {
  /** 응답 데이터 */
  data: T | undefined;
  /** 현재 상태 */
  status: FetchStatus;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** mutation 실행 함수 */
  mutate: (variables: V) => Promise<T | undefined>;
  /** 상태 초기화 */
  reset: () => void;
}

/**
 * 데이터 mutation(POST, PUT, DELETE 등)을 위한 Hook
 *
 * @template T - 응답 데이터의 타입
 * @template V - 요청 body의 타입
 * @param url - fetch할 URL
 * @param options - 추가 옵션
 *
 * @example
 * ```tsx
 * // POST 요청
 * const { mutate, isLoading } = useMutation<User, CreateUserInput>("/api/users");
 * const handleSubmit = (data: CreateUserInput) => mutate(data);
 *
 * // DELETE 요청
 * const { mutate } = useMutation<void, { id: string }>("/api/users", {
 *   method: "DELETE",
 *   onSuccess: () => console.log("Deleted!"),
 * });
 * ```
 */
export const useMutation = <T = unknown, V = unknown>(
  url: string,
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> => {
  const { method = "POST", headers, onError, onSuccess } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onError, onSuccess]);

  const mutate = useCallback(
    async (variables: V): Promise<T | undefined> => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${url}`,
          {
            method,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify(variables),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        const result = contentType?.includes("application/json")
          ? ((await response.json()) as T)
          : (undefined as T);

        setData(result);
        setStatus("success");
        onSuccessRef.current?.(result, variables);
        return result;
      } catch (err) {
        const mutationError =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(mutationError);
        setStatus("error");
        onErrorRef.current?.(mutationError);
        return undefined;
      }
    },
    [url, method, headers]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    data,
    status,
    isLoading: status === "loading",
    error,
    mutate,
    reset,
  };
};
