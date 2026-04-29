const bannerButtons = Array.from(document.querySelectorAll(".banner-switcher [data-painting-target]"));
const bannerPaintings = document.querySelector("[data-banner-paintings]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (bannerButtons.length && bannerPaintings) {
const paintingTemplateMap = new Map(
Array.from(document.querySelectorAll("[data-painting-template]")).map((template) => [
template.dataset.paintingTemplate,
template
])
);
const paintingDefinitions = bannerButtons.map((button, index) => ({
id: button.dataset.paintingTarget,
salt: index + 1,
template: paintingTemplateMap.get(button.dataset.paintingTarget)
}));
const paintingDefinitionMap = new Map(
paintingDefinitions.map((definition) => [definition.id, definition])
);
const paintingMap = new Map();

const transitionDuration = 2000;
let activePainting = null;
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

const loadPainting = (targetId) => {
const cachedPainting = paintingMap.get(targetId);

if (cachedPainting) {
return cachedPainting;
}

const definition = paintingDefinitionMap.get(targetId);
const group = definition?.template?.content?.querySelector("g")?.cloneNode(true);

if (!group) {
return null;
}

group.id = definition.id;
group.setAttribute("data-painting", definition.id.replace(/^img-/, ""));
group.setAttribute("data-painting-current", "false");
bannerPaintings.append(group);
paintingMap.set(definition.id, group);

return group;
};

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
const definition = paintingDefinitionMap.get(targetId);

if (!definition || transitionTimer) {
return;
}

const nextPainting = loadPainting(targetId);

if (!nextPainting || nextPainting === activePainting) {
return;
}

clearPaintingStyles(activePainting);
clearPaintingStyles(nextPainting);
updateButtons(targetId);

if (!activePainting || reduceMotion.matches) {
setPaintingVisible(activePainting, false);
setPaintingVisible(nextPainting, true);
activePainting = nextPainting;
return;
}

const leavingPainting = activePainting;
const enteringPainting = nextPainting;
const leavingElements = getPaintingOrder(Array.from(leavingPainting.children), definition.salt);
const enteringElements = getPaintingOrder(Array.from(enteringPainting.children), definition.salt + 1);
const leavingStep = transitionDuration / Math.max(leavingElements.length, 1);
const enteringStep = transitionDuration / Math.max(enteringElements.length, 1);

leavingPainting.dataset.paintingTransition = "true";
enteringPainting.dataset.paintingTransition = "true";
enteringPainting.dataset.paintingCurrent = "true";

leavingElements.forEach((element, index) => {
element.style.opacity = "0";
element.style.transitionDelay = `${Math.round(index * leavingStep)}ms`;
});

enteringElements.forEach((element, index) => {
element.style.opacity = "1";
element.style.transitionDelay = `${Math.round(index * enteringStep)}ms`;
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

activePainting = loadPainting(paintingDefinitions[0].id);

if (activePainting) {
setPaintingVisible(activePainting, true);
updateButtons(activePainting.id);
}
}
