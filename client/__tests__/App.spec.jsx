import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import App from '../src/App';

// 👇 mock axios
import axios from 'axios';
jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/values/current') {
        return Promise.resolve({ data: { 1: '1', 2: '1' } });
      }
      if (url === '/api/values/all') {
        return Promise.resolve({ data: [{ number: 1 }, { number: 2 }] });
      }
    });
  });

  it('renders the navigation link, instruction text, indexes and calculated values', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Navigation link
    const link = screen.getByRole('link', { name: /go to other page/i });
    expect(link).toBeInTheDocument();

    // Instruction text
    const docsText = screen.getByText(/click on the vite and react logos/i);
    expect(docsText).toBeInTheDocument();

    // Wait for indexes to appear
    await waitFor(() => {
      expect(screen.getByText('1, 2')).toBeInTheDocument();
    });

    // Wait for calculated values to appear
    await waitFor(() => {
      expect(
        screen.getByText('For index 1, I calculated 1')
      ).toBeInTheDocument();
      expect(
        screen.getByText('For index 2, I calculated 1')
      ).toBeInTheDocument();
    });
  });
});
