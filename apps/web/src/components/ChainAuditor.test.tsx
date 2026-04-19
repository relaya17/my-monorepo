/**
 * Tests for ChainAuditor component.
 * Verifies button render, scan loading state, and result display.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ChainAuditor from './ChainAuditor';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('ChainAuditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the audit button in idle state', () => {
    render(<ChainAuditor />);
    expect(screen.getByText('הרץ בדיקת תקינות')).toBeInTheDocument();
    expect(screen.getByText(/בדיקה זו מאמתת/)).toBeInTheDocument();
  });

  it('shows secure result when chain is valid', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: {
        valid: true,
        checkedCount: 1234,
        brokenAt: null,
        verifiedAt: new Date().toISOString(),
        message: 'Chain integrity verified.',
      },
    });

    render(<ChainAuditor />);
    fireEvent.click(screen.getByText('הרץ בדיקת תקינות'));

    await waitFor(() => {
      expect(screen.getByText(/שרשרת תקינה/)).toBeInTheDocument();
      expect(screen.getByText(/1,234/)).toBeInTheDocument();
    });
  });

  it('shows compromised result when chain is broken', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: {
        valid: false,
        checkedCount: 500,
        brokenAt: { id: 'abc123', index: 42, hash: 'deadbeef' },
        verifiedAt: new Date().toISOString(),
        message: 'CRITICAL: Data tampering detected at entry 42',
      },
    });

    render(<ChainAuditor />);
    fireEvent.click(screen.getByText('הרץ בדיקת תקינות'));

    await waitFor(() => {
      const criticalElements = screen.getAllByText(/CRITICAL/);
      expect(criticalElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/abc123/)).toBeInTheDocument();
    });
  });

  it('shows error message when request fails', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<ChainAuditor />);
    fireEvent.click(screen.getByText('הרץ בדיקת תקינות'));

    await waitFor(() => {
      expect(screen.getByText(/שגיאה בהרצת בדיקת השרשרת/)).toBeInTheDocument();
    });
  });
});
