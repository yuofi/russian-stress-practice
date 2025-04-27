// This is a fallback script in case the main bundle fails to load
console.log("Fallback script loaded - if you see this, the main bundle didn't load correctly");
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML += '<p style="color:red">Warning: Main application script failed to load properly.</p>';
  }
});