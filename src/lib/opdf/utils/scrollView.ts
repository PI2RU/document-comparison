import { getLinkId } from "../core";

export const DATA_ID_PREFIX = "data-match-super-";
export const SELECT_HIGH_LIGHT_PREFIX = "select_highlight";

export const ScrollView = (
  options: {
    to?: string;
    duration?: number;
    scrollContainer?: HTMLElement | Window | string;
    renderParent?: boolean;
  } = {
    to: "",
    duration: 150,
    renderParent: false,
  }
) => {
  console.log("scroll options -->", options);

  if (options?.duration && options?.duration <= 0) {
    console.error("duration must be greater than 0");
  }

  if (!options?.to) {
    console.error("to must be defined");
    return;
  }

  // const ele = document.getElementById(`${PREFIX_STR}${options.to}`);

  const dataId = getLinkId(options.to);

  const allElement = document.querySelectorAll(
    `[data-match-id="${DATA_ID_PREFIX}${dataId}"]`
  );

  const elements = document.getElementsByClassName(SELECT_HIGH_LIGHT_PREFIX);

  // 去除所有的高亮
  Array.from(elements).forEach((ele) => {
    ele?.classList.remove(SELECT_HIGH_LIGHT_PREFIX);
  });

  setTimeout(() => {
    if (typeof options.to === "string") {
      const ele = allElement?.[0];

      if (ele) {
        const offset = ele.getBoundingClientRect();
        let parentEle: HTMLElement | Window = window;

        try {
          if (typeof options.scrollContainer === "string") {
            const ele = document.getElementById(options.scrollContainer);
            if (ele) {
              parentEle = ele;
            }
          } else if (options.scrollContainer) {
            parentEle = options.scrollContainer;
          }

          if (parentEle === window) {
            parentEle.scrollTo(
              offset.left + window.scrollX - window.innerWidth / 2,
              offset.top + window.scrollY - window.innerHeight / 2
            );
          } else if (parentEle instanceof HTMLElement) {
            parentEle.scrollTo(
              offset.left,
              parentEle.scrollTop + offset.top - parentEle.clientHeight / 2
            );
          }

          allElement.forEach((item) => {
            if (options.renderParent) {
              const parent = item.parentElement;
              if (parent) {
                parent.classList.add(SELECT_HIGH_LIGHT_PREFIX);
              } else {
                console.error("parent is null");
              }
            } else {
              item.classList.add(SELECT_HIGH_LIGHT_PREFIX);
            }
          });
        } catch (err) {
          console.error("scroll error", err);
        }
      }
    }
  }, options.duration);
};
