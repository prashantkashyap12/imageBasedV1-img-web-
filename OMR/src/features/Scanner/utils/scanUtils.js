
// Constants ───────────────────────────────────────────────────────────────
export const MAX_VISIBLE = 20;

// Debounce ─────────────────────────────────────────────────────────────────
export function debounce(func, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// Grid Empty Template ─────────────────────────────────────────────────────
export function emptyMessageTemplate() {
  return (
    <div className="text-center">
      <img
        src="https://ej2.syncfusion.com/react/demos/src/grid/images/emptyRecordTemplate_light.svg"
        className="d-block mx-auto my-2"
        alt="No record"
      />
      <span>
        There is no data available to display at the moment.
      </span>
    </div>
  );
}