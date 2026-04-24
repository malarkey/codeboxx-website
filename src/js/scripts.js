const bannerButtons = Array.from(document.querySelectorAll(".banner-switcher [data-painting-target]"));
const bannerPaintings = document.querySelector("[data-banner-paintings]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (bannerButtons.length && bannerPaintings) {
const paintingDefinitions = bannerButtons.map((button, index) => ({
id: button.dataset.paintingTarget,
salt: index + 1,
src: button.dataset.paintingSrc
}));
const paintingDefinitionMap = new Map(
paintingDefinitions.map((definition) => [definition.id, definition])
);
const paintingMap = new Map();
const paintingRequests = new Map();

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

const loadPainting = async (targetId) => {
const cachedPainting = paintingMap.get(targetId);

if (cachedPainting) {
return cachedPainting;
}

if (paintingRequests.has(targetId)) {
return paintingRequests.get(targetId);
}

const definition = paintingDefinitionMap.get(targetId);

if (!definition || !definition.src) {
return null;
}

const request = fetch(definition.src)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load ${definition.src}`);
    }

    return response.text();
  })
  .then((content) => {
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(content, "image/svg+xml");
    const group = documentFragment.querySelector("g");

    if (!group) {
      throw new Error(`No painting group found in ${definition.src}`);
    }

    group.id = definition.id;
    group.setAttribute("data-painting", definition.id.replace(/^img-/, ""));
    group.setAttribute("data-painting-current", "false");
    bannerPaintings.append(group);
    paintingMap.set(definition.id, group);

    return group;
  })
  .finally(() => {
    paintingRequests.delete(targetId);
  });

paintingRequests.set(targetId, request);

return request;
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

const warmPainting = (targetId) => {
loadPainting(targetId).catch(() => {});
};

const switchPainting = (targetId) => {
const definition = paintingDefinitionMap.get(targetId);

if (!definition || transitionTimer) {
return;
}

loadPainting(targetId).then((nextPainting) => {
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
}).catch(() => {
updateButtons(activePainting ? activePainting.id : bannerButtons[0].dataset.paintingTarget);
});
};

bannerButtons.forEach((button) => {
button.addEventListener("click", () => {
switchPainting(button.dataset.paintingTarget);
});
button.addEventListener("focus", () => {
warmPainting(button.dataset.paintingTarget);
});
button.addEventListener("pointerenter", () => {
warmPainting(button.dataset.paintingTarget);
});
});

const preloadPaintings = () => {
paintingDefinitions.slice(1).forEach((definition) => {
loadPainting(definition.id).catch(() => {});
});
};

loadPainting(paintingDefinitions[0].id).then((group) => {
if (!group || activePainting) {
return;
}

activePainting = group;
setPaintingVisible(activePainting, true);
updateButtons(activePainting.id);

window.setTimeout(preloadPaintings, 50);
}).catch(() => {});
}
