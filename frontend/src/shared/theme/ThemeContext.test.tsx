import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeProbe() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setTheme('dark')}>set-dark</button>
      <button onClick={() => setTheme('light')}>set-light</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should_default_to_light_when_no_preference_stored', () => {
    // Arrange
    // Act
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    // Assert
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should_restore_stored_theme_from_localStorage', () => {
    // Arrange
    window.localStorage.setItem('hitti-theme', 'dark');

    // Act
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    // Assert
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should_toggle_between_light_and_dark', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    // Act
    await user.click(screen.getByRole('button', { name: 'toggle' }));

    // Assert
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Act again
    await user.click(screen.getByRole('button', { name: 'toggle' }));

    // Assert
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should_persist_chosen_theme_to_localStorage', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>);

    // Act
    await user.click(screen.getByRole('button', { name: 'set-dark' }));

    // Assert
    expect(window.localStorage.getItem('hitti-theme')).toBe('dark');
  });

  it('should_throw_when_useTheme_is_called_outside_provider', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act + Assert
    expect(() => render(<ThemeProbe />)).toThrow(/ThemeProvider/);

    spy.mockRestore();
  });
});

