import { describe, it, expect } from 'vitest';
import { isValidNorwegianPhone, isValidEmail, normalizeNorwegianPhone } from './validation';

describe('isValidNorwegianPhone', () => {
  it('should_accept_8_bare_digits', () => {
    // Arrange
    const phone = '12345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('should_accept_plus_47_prefix', () => {
    // Arrange
    const phone = '+4712345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('should_accept_47_prefix_without_plus', () => {
    // Arrange
    const phone = '4712345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('should_accept_spaces_in_number', () => {
    // Arrange
    const phone = '+47 12 34 56 78';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('should_reject_empty_string', () => {
    // Arrange
    const phone = '';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_7_digits', () => {
    // Arrange
    const phone = '1234567';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_9_digits_without_country_code', () => {
    // Arrange
    const phone = '123456789';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_non_norwegian_country_code', () => {
    // Arrange
    const phone = '+4512345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_letters', () => {
    // Arrange
    const phone = '+47abcdefgh';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });
});

describe('normalizeNorwegianPhone', () => {
  it('should_strip_spaces', () => {
    // Arrange
    const phone = '+47 12 34 56 78';

    // Act
    const result = normalizeNorwegianPhone(phone);

    // Assert
    expect(result).toBe('+4712345678');
  });

  it('should_leave_already_compact_number_unchanged', () => {
    // Arrange
    const phone = '12345678';

    // Act
    const result = normalizeNorwegianPhone(phone);

    // Assert
    expect(result).toBe('12345678');
  });
});

describe('isValidEmail', () => {
  it('should_accept_simple_email', () => {
    // Arrange
    const email = 'thomas@hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('should_accept_email_with_subdomain', () => {
    // Arrange
    const email = 'admin@apps.hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('should_trim_surrounding_whitespace', () => {
    // Arrange
    const email = '  thomas@hitti.no  ';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('should_reject_email_without_at_sign', () => {
    // Arrange
    const email = 'thomas.hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_email_without_tld', () => {
    // Arrange
    const email = 'thomas@hitti';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });

  it('should_reject_empty_string', () => {
    // Arrange
    const email = '';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });
});
