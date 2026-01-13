export function createUI({ container, initialAutoMove, onToggle }) {
  const uiRoot = document.createElement("div");
  uiRoot.style.position = "absolute";
  uiRoot.style.top = "16px";
  uiRoot.style.left = "16px";
  uiRoot.style.padding = "12px 14px";
  uiRoot.style.background = "rgba(15, 17, 21, 0.75)";
  uiRoot.style.border = "1px solid rgba(148, 163, 184, 0.4)";
  uiRoot.style.borderRadius = "8px";
  uiRoot.style.fontSize = "14px";
  uiRoot.style.color = "#e2e8f0";
  uiRoot.style.zIndex = "10";
  uiRoot.style.minWidth = "200px";
  uiRoot.style.pointerEvents = "auto";

  const button = document.createElement("button");
  button.type = "button";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.padding = "6px 10px";
  button.style.borderRadius = "6px";
  button.style.border = "1px solid #94a3b8";
  button.style.background = "#1e293b";
  button.style.color = "#e2e8f0";
  button.style.cursor = "pointer";
  button.style.marginBottom = "8px";

  const debug = document.createElement("div");
  debug.style.whiteSpace = "pre-line";

  uiRoot.appendChild(button);
  uiRoot.appendChild(debug);
  container.appendChild(uiRoot);

  let currentAutoMove = initialAutoMove;

  const setButtonLabel = (isOn) => {
    button.textContent = `Auto Move: ${isOn ? "ON" : "OFF"}`;
  };

  setButtonLabel(currentAutoMove);

  const handleToggle = () => {
    currentAutoMove = !currentAutoMove;
    setButtonLabel(currentAutoMove);
    onToggle(currentAutoMove);
  };

  button.addEventListener("click", handleToggle);

  const updateDebug = ({ autoMove, player, target, distance }) => {
    const targetText = target ? `${target.x.toFixed(1)}, ${target.y.toFixed(1)}` : "none";
    const distanceText = target ? distance.toFixed(2) : "-";

    debug.textContent = [
      `AutoMove: ${autoMove ? "ON" : "OFF"}`,
      `Player: ${player.x.toFixed(1)}, ${player.y.toFixed(1)}`,
      `Target: ${targetText}`,
      `Distance: ${distanceText}`,
    ].join("\n");
  };

  const destroy = () => {
    button.removeEventListener("click", handleToggle);
    uiRoot.remove();
  };

  return {
    updateDebug,
    setButtonLabel,
    destroy,
  };
}
