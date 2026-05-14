import { describe, it, expect } from 'vitest';
import { isValidNorwegianPhone, isValidEmail, normalizeNorwegianPhone } from './validation';

describe('isValidNorwegianPhone', () => {
  it('godtar 8 sifre uten landkode', () => {
    // Arrange
    const phone = '12345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('godtar nummer med +47-prefiks', () => {
    // Arrange
    const phone = '+4712345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('godtar 47-prefiks uten plusstegn', () => {
    // Arrange
    const phone = '4712345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('godtar mellomrom i nummeret', () => {
    // Arrange
    const phone = '+47 12 34 56 78';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(true);
  });

  it('avviser tom streng', () => {
    // Arrange
    const phone = '';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser 7 sifre', () => {
    // Arrange
    const phone = '1234567';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser 9 sifre uten landkode', () => {
    // Arrange
    const phone = '123456789';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser ikke-norsk landkode', () => {
    // Arrange
    const phone = '+4512345678';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser bokstaver i nummeret', () => {
    // Arrange
    const phone = '+47abcdefgh';

    // Act
    const result = isValidNorwegianPhone(phone);

    // Assert
    expect(result).toBe(false);
  });
});

describe('normalizeNorwegianPhone', () => {
  it('fjerner mellomrom fra nummeret', () => {
    // Arrange
    const phone = '+47 12 34 56 78';

    // Act
    const result = normalizeNorwegianPhone(phone);

    // Assert
    expect(result).toBe('+4712345678');
  });

  it('lar allerede kompakt nummer stå uendret', () => {
    // Arrange
    const phone = '12345678';

    // Act
    const result = normalizeNorwegianPhone(phone);

    // Assert
    expect(result).toBe('12345678');
  });
});

describe('isValidEmail', () => {
  it('godtar enkel e-postadresse', () => {
    // Arrange
    const email = 'thomas@hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('godtar e-post med subdomene', () => {
    // Arrange
    const email = 'admin@apps.hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('trimmer mellomrom rundt e-postadressen', () => {
    // Arrange
    const email = '  thomas@hitti.no  ';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it('avviser e-post uten alfakrøll', () => {
    // Arrange
    const email = 'thomas.hitti.no';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser e-post uten toppdomene', () => {
    // Arrange
    const email = 'thomas@hitti';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });

  it('avviser tom streng som e-post', () => {
    // Arrange
    const email = '';

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(false);
  });
});
