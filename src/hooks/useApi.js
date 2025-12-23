'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * Custom hook for making API calls with loading, error, and data states
 */
export function useApi(apiFunction, options = {}) {
  const {
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = 'Operation successful',
    immediate = false,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      setData(response.data || response);
      
      if (showSuccessMessage) {
        message.success(response.message || successMessage);
      }
      
      onSuccess?.(response);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorMessage) {
        message.error(errorMessage);
      }
      
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessMessage, showErrorMessage, successMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi(apiFunction, options = {}) {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
  
  const [pagination, setPagination] = useState({
    current: initialPage,
    pageSize: initialLimit,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({});

  const { data, loading, error, execute } = useApi(apiFunction, apiOptions);

  const fetch = useCallback(async (params = {}) => {
    const queryParams = {
      page: params.page || pagination.current,
      limit: params.limit || pagination.pageSize,
      ...filters,
      ...sorter,
      ...params,
    };

    const response = await execute(queryParams);
    
    if (response?.pagination) {
      setPagination((prev) => ({
        ...prev,
        current: response.pagination.page,
        total: response.pagination.total,
      }));
    }
    
    return response;
  }, [execute, pagination.current, pagination.pageSize, filters, sorter]);

  const handleTableChange = useCallback((newPagination, newFilters, newSorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    
    if (newSorter.field) {
      setSorter({
        sortBy: newSorter.field,
        sortOrder: newSorter.order === 'descend' ? 'desc' : 'asc',
      });
    }

    fetch({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  }, [fetch]);

  const handleSearch = useCallback((search) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetch({ search, page: 1 });
  }, [fetch]);

  const handleFilter = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetch({ ...newFilters, page: 1 });
  }, [fetch]);

  const refresh = useCallback(() => {
    fetch();
  }, [fetch]);

  return {
    data: data?.data || [],
    loading,
    error,
    pagination,
    filters,
    fetch,
    refresh,
    handleTableChange,
    handleSearch,
    handleFilter,
  };
}

export default useApi;

