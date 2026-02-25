import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';
import { describe, it, expect, vi } from 'vitest';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 150));
    expect(result.current).toBe('initial');
  });

  it('should not update value before delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 150 } }
    );

    rerender({ value: 'updated', delay: 150 });

    // Before delay, should still be initial
    expect(result.current).toBe('initial');
  });

  it('should update value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 50 } }
    );

    rerender({ value: 'updated', delay: 50 });

    // Wait for delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 60));
    });

    expect(result.current).toBe('updated');
  });
});
