export const PRODUCT_NAME = "Soccer Terminal";

export const TITLE_TEMPLATE = `%s - ${PRODUCT_NAME}`;

export function pageTitle(pageName: string) {
  return `${pageName} - ${PRODUCT_NAME}`;
}
