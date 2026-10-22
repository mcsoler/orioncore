import { describe, expect, it } from 'vitest';
import { richText, stars } from '../../../src/ui/presenters/richText';

describe('richText', () => {
  it('convierte [texto](/ruta/) en enlaces y deja el resto como texto', () => {
    expect(richText('Lee la [guía](/blog/guia/) y la [calculadora](/#calculadora).')).toEqual([
      { text: 'Lee la ' },
      { text: 'guía', href: '/blog/guia/' },
      { text: ' y la ' },
      { text: 'calculadora', href: '/#calculadora' },
      { text: '.' },
    ]);
  });

  it('los marcadores pendientes ([Contenido…]) no son enlaces, aunque contengan uno', () => {
    expect(richText('[Contenido].')).toEqual([{ text: '[Contenido].' }]);
    expect(richText('[Texto con enlace a [software](/servicios/software-a-medida/)].')).toEqual([
      { text: '[Texto con enlace a ' },
      { text: 'software', href: '/servicios/software-a-medida/' },
      { text: '].' },
    ]);
  });
});

describe('stars', () => {
  it('pinta la calificación con estrellas llenas y vacías', () => {
    expect(stars(5)).toBe('★★★★★');
    expect(stars(4)).toBe('★★★★☆');
    expect(stars(9)).toBe('★★★★★');
  });
});
