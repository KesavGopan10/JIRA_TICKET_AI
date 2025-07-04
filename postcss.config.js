import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindcssPostcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcssPostcss,
    autoprefixer,
  ],
};
