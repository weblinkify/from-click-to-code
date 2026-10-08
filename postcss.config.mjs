// postcss.config.mjs
// PostCSS is a tool that transforms CSS. Here it runs Tailwind CSS, which
// turns the class names we write (like "rounded-xl bg-white p-6") into
// real CSS when the app is built.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
