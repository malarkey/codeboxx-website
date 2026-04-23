const bannerButtons = Array.from(document.querySelectorAll(".banner-switcher [data-painting-target]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (bannerButtons.length) {
const paintingMap = new Map(
bannerButtons.map((button) => [button.dataset.paintingTarget, document.getElementById(button.dataset.paintingTarget)])
);

const transitionDuration = 2000;
let activePainting = paintingMap.get(bannerButtons[0].dataset.paintingTarget);
let transitionTimer = null;

const clearPaintingStyles = (group) => {
if (!group) {
return;
}

Array.from(group.children).forEach((element) => {
element.style.opacity = "";
element.style.transitionDelay = "";
});
};

const getPaintingOrder = (elements, salt) =>
elements
.map((element, index) => {
const randomValue = Math.abs(Math.sin((index + 1) * (salt + 1) * 97.13));

return { element, randomValue };
})
.sort((left, right) => left.randomValue - right.randomValue)
.map((entry) => entry.element);

const setPaintingVisible = (group, visible) => {
if (!group) {
return;
}

group.dataset.paintingCurrent = visible ? "true" : "false";
delete group.dataset.paintingTransition;

Array.from(group.children).forEach((element) => {
element.style.opacity = visible ? "1" : "0";
element.style.transitionDelay = "0ms";
});
};

const updateButtons = (targetId) => {
bannerButtons.forEach((button) => {
button.setAttribute("aria-pressed", button.dataset.paintingTarget === targetId ? "true" : "false");
});
};

const switchPainting = (targetId) => {
const nextPainting = paintingMap.get(targetId);

if (!nextPainting || nextPainting === activePainting) {
return;
}

if (transitionTimer) {
return;
}

clearPaintingStyles(activePainting);
clearPaintingStyles(nextPainting);
updateButtons(targetId);

if (reduceMotion.matches) {
setPaintingVisible(activePainting, false);
setPaintingVisible(nextPainting, true);
activePainting = nextPainting;
return;
}

const leavingPainting = activePainting;
const enteringPainting = nextPainting;
const leavingElements = getPaintingOrder(Array.from(leavingPainting.children), 1);
const enteringElements = getPaintingOrder(Array.from(enteringPainting.children), 2);
const leavingStep = transitionDuration / Math.max(leavingElements.length, 1);
const enteringStep = transitionDuration / Math.max(enteringElements.length, 1);

leavingPainting.dataset.paintingTransition = "true";
enteringPainting.dataset.paintingTransition = "true";
enteringPainting.dataset.paintingCurrent = "true";

leavingElements.forEach((element, index) => {
element.style.transitionDelay = `${Math.round(index * leavingStep)}ms`;
element.style.opacity = "0";
});

enteringElements.forEach((element, index) => {
element.style.transitionDelay = `${Math.round(index * enteringStep)}ms`;
element.style.opacity = "1";
});

transitionTimer = window.setTimeout(() => {
leavingPainting.dataset.paintingCurrent = "false";
delete leavingPainting.dataset.paintingTransition;
delete enteringPainting.dataset.paintingTransition;
clearPaintingStyles(leavingPainting);
clearPaintingStyles(enteringPainting);
activePainting = enteringPainting;
transitionTimer = null;
}, transitionDuration + 450);
};

bannerButtons.forEach((button) => {
button.addEventListener("click", () => {
switchPainting(button.dataset.paintingTarget);
});
});

paintingMap.forEach((group, id) => {
setPaintingVisible(group, group === activePainting);
if (group === activePainting) {
updateButtons(id);
}
});
}
