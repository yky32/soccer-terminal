/** Runs before paint to apply stored theme and avoid a light flash. */
export function ThemeInitScript() {
  const script = `(function(){try{var k="soccer-monitor-theme";if(localStorage.getItem(k)==="dark"){localStorage.setItem(k,"light");}document.documentElement.classList.remove("dark");}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
